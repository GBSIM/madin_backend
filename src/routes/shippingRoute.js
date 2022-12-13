const { Router } = require('express');
const { User, Shipping } = require('../models');
const { isValidObjectId } = require('mongoose');

const shippingRouter = Router();

/**
* @openapi
* /shipping:
*   get:
*       description: Get all the shippings list
*       responses:
*           200: 
*               description: A JSON array of shipping
*       tags:
*           - Shipping
*/
shippingRouter.get('/',async(req,res) => {
    try {
        const shipping = await Shipping.find();
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /shipping/{userId}:
*   get:
*       description: Get all the shippings of the specific user
*       parameters:
*           - name: userId
*             in: path     
*             description: id of the user
*             schema:
*               type: string
*       responses:
*           200: 
*               description: A JSON array of shipping
*       tags:
*           - Shipping
*/
shippingRouter.get('/:userId',async(req,res) => {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId)) return res.status(400).send({err: "invalid user id"})
        const shipping = await Shipping.find({userId: userId});
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /shipping:
*   post:
*       description: register shipping information
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           name:
*                               type: string
*                           phone:
*                               type: string
*                           basicAddress:
*                               type: string
*                           detailAddress:
*                               type: string
*                           request:
*                               type: string
*                           tag:
*                               type: string
*                           token:
*                               type: string
*       responses:
*           200: 
*               description: Returns the registered shipping
*       tags:
*           - Shipping
*/
shippingRouter.post('/', async(req,res) => {
    try {
        let {name, phone, basicAddress, detailAddress, request, tag, token} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!phone) return res.status(400).send({err: "phone is required"})
        if (!basicAddress) return res.status(400).send({err: "basicAddress is required"})
        if (!detailAddress) return res.status(400).send({err: "detailAddress is required"})
        if (!token) return res.status(400).send({err: "token is required"})
        let user = await User.findOne({token: token});
        userId = user._id;
        if (!user) return res.status(400).send({err: "invalid user"})
        if (user.token !== token) return res.status(400).send({err: "token is invalid"})
        const shipping = new Shipping({ ...req.body,userId});
        await Promise.all([
            shipping.save(),
            User.updateOne({ _id: user._id }, { $push: {shippings: shipping}})
        ]);        
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /shipping/{shippingId}:
*   patch:
*       description: update shipping
*       parameters:
*           - name: shippingId
*             in: path     
*             description: id of the shipping
*             schema:
*               type: string
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           name:
*                               type: string
*                           phone:
*                               type: string
*                           basicAddress:
*                               type: string
*                           detailAddress:
*                               type: string
*                           request:
*                               type: string
*                           tag:
*                               type: string
*                           token:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of updated shipping information
*       tags:
*           - Shipping
*/
shippingRouter.patch('/:_id', async(req,res) => {
    try {
        const { _id } = req.params;
        const { name, phone, basicAddress, detailAddress, request, tag, token } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        if (!isValidObjectId(_id)) return res.status(400).send({err: "invalid shipping id"})
        const shipping = await Shipping.findByIdAndUpdate(_id, {$set: {name, phone, basicAddress, detailAddress, request, tag}},{new: true});
        const user = await User.findById(shipping.userId);
        if (user.token !== token) return res.status(400).send({err: "invalid token"})
        await User.updateOne(
            { 'shippings._id': _id }, 
            { "shippings.$.name":name, "shippings.$.phone":phone, "shippings.$.basicAddress": basicAddress, 
              "shippings.$.detailAddress": detailAddress, "shippings.$.request": request, "shippings.$.tag": tag})
        return res.send({ shipping })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /shipping/{shippingId}:
*   delete:
*       description: delete a shipping
*       parameters:
*           - name: shippingId
*             in: path     
*             description: id of shipping
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted shipping
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string
*       tags:
*           - Shipping
*/
shippingRouter.delete('/:_id', async(req,res) => {
    try {
        const { _id } = req.params;
        if (!isValidObjectId(_id)) return res.status(400).send({err: "invalid shipping id"})
        const { token } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        const shipping = await Shipping.findByIdAndRemove(_id);
        if (!shipping) return res.status(400).send({err: "Invalid shipping id"})
        const user = await User.findById(shipping.userId);
        if (user.token !== token) res.status(400).send({err: "invalid token"})
        await User.updateOne(
            { "shippings._id":_id},
            { $pull: { shippings: {_id: _id}}});
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { shippingRouter };