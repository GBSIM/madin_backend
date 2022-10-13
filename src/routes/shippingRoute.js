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
        const shipping = await Shipping.find({user: userId});
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /shipping/{userId}:
*   post:
*       description: register shipping information
*       parameters:
*           - name: userId
*             in: path     
*             description: id of the user
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
*                           address:
*                               type: string
*                           request:
*                               type: string
*                           tag:
*                               type: string
*       responses:
*           200: 
*               description: Returns the registered shipping
*       tags:
*           - Shipping
*/
shippingRouter.post('/:userId', async(req,res) => {
    try {
        const { userId } = req.params;
        let {name, phone, address, request, tag} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!phone) return res.status(400).send({err: "phone is required"})
        if (!address) return res.status(400).send({err: "address is required"})
        if (!tag) return res.status(400).send({err: "tag is required"})
        if (!userId) return res.status(400).send({err: "userId is required"})
        let user = await User.findById(userId)
        if (!user) return res.status(400).send({err: "invalid user"})
        const shipping = new Shipping({ ...req.body,userId});
        await Promise.all([
            shipping.save(),
            User.updateOne({ _id: userId }, { $push: {shippings: shipping}})
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
*                           address:
*                               type: string
*                           request:
*                               type: string
*                           tag:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of updated shipping information
*       tags:
*           - Shipping
*/
shippingRouter.patch('/:shippingId', async(req,res) => {
    try {
        const { shippingId } = req.params;
        const { name, phone, address, request, tag } = req.body;
        if (!isValidObjectId(shippingId)) return res.status(400).send({err: "invalid shipping id"})
        const shipping = await Shipping.findByIdAndUpdate(shippingId, {$set: {name, phone, address, request, tag}},{new: true});
        await User.updateOne(
            { 'shippings._id': shippingId }, 
            { "shippings.$.name":name, "shippings.$.phone":phone, "shippings.$.address": address, "shippings.$.request": request, "shippings.$.tag": tag})
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
*       tags:
*           - Shipping
*/
shippingRouter.delete('/:shippingId', async(req,res) => {
    try {
        const { shippingId } = req.params;
        if (!isValidObjectId(shippingId)) return res.status(400).send({err: "invalid shipping id"})
        const shipping = await Shipping.findByIdAndRemove(shippingId);
        if (!shipping) return res.status(400).send({err: "Invalid shipping id"})
        await User.updateOne(
            { "shippings._id":shippingId},
            { $pull: { shippings: {_id: shippingId}}});
        return res.send({shipping})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { shippingRouter };