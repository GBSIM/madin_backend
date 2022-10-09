const { Router } = require('express');
const { PersonalOrder } = require('../models/PersonalOrder');
const { User } = require('../models/User');
const { isValidObjectId } = require('mongoose');

const personalOrderRouter = Router();

/**
* @openapi
* /personalorder:
*   get:
*       description: Get all the personal orders list
*       responses:
*           200: 
*               description: A list of JSON array of personal order
*       tags:
*           - Order
*/
personalOrderRouter.get('/',async(req,res) => {
    try {
        const personalOrder = await PersonalOrder.find();
        return res.send({personalOrder})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /personalorder/{orderId}:
*   get:
*       description: Get an order
*       parameters:
*           - name: orderId
*             in: path     
*             description: id of the order
*             schema:
*               type: string
*       responses:
*           200: 
*               description: A JSON array of personal order
*       tags:
*           - Order
*/
personalOrderRouter.get('/:orderId',async(req,res) => {
    try {
        const { orderId } = req.params;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const personalOrder = await PersonalOrder.findById(orderId);
        return res.send({personalOrder})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /personalorder:
*   post:
*       description: Order
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           product:
*                               type: array
*                               items:
*                                   type: object
*                           ordererId:
*                               type: string
*                           shipping:
*                               type: object
*                           mileageUse:
*                               type: number
*                           payment:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of requested personal order
*       tags:
*           - Order
*/
personalOrderRouter.post('/', async(req,res) => {
    try {
        let {product, ordererId, shipping, mileageUse, coupon, payment} = req.body;
        if (!product) return res.status(400).send({err: "product is required"})
        if (!ordererId) return res.status(400).send({err: "ordererId is required"})
        if (!shipping) return res.status(400).send({err: "shipping is required"})
        if (!mileageUse) return res.status(400).send({err: "mileageUse is required"})
        if (!payment) return res.status(400).send({err: "payment is required"})
        let orderer = await User.findById(ordererId)
        const personalOrder = new PersonalOrder({ ...req.body,orderer });
        await personalOrder.save();
        return res.send({personalOrder})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /personalorder/{orderId}:
*   put:
*       description: modify personal order
*       parameters:
*           - name: orderId
*             in: path     
*             description: id of the order
*             schema:
*               type: string
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           shipping:
*                               type: object
*       responses:
*           200: 
*               description:  A JSON object of requested personal order
*       tags:
*           - Order
*/
personalOrderRouter.put('/:orderId', async(req,res) => {
    try {
        const { orderId } = req.params;
        const { shipping } = req.body;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const personalOrder = await PersonalOrder.findByIdAndUpdate(orderId, {$set: {shipping}},{new: true});
        return res.send({personalOrder})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /personalorder/{orderId}:
*   delete:
*       description: delete an personal order
*       parameters:
*           - name: orderId
*             in: path     
*             description: id of personal order
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted personal order
*       tags:
*           - Order
*/
personalOrderRouter.delete('/:orderId', async(req,res) => {
    try {
        const { orderId } = req.params;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const personalOrder = await PersonalOrder.findByIdAndRemove(orderId);
        return res.send({personalOrder})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { personalOrderRouter };