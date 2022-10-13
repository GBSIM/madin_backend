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
*                           address:
*                               type: string
*                           request:
*                               type: string
*                           tag:
*                               type: string
*                           userId:
*                               type: string
*       responses:
*           200: 
*               description: Returns the registered user
*       tags:
*           - User
*/
shippingRouter.post('/', async(req,res) => {
    try {
        let {name, phone, address, request, tag, userId} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!phone) return res.status(400).send({err: "phone is required"})
        if (!address) return res.status(400).send({err: "address is required"})
        if (!tag) return res.status(400).send({err: "tag is required"})
        if (!userId) return res.status(400).send({err: "userId is required"})
        const shipping = new Shipping(req.body);
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

module.exports = { shippingRouter };