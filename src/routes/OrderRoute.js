const { Router } = require('express');
const { User, Order } = require('../models');
const { isValidObjectId } = require('mongoose');

const orderRouter = Router();

/**
* @openapi
* /order:
*   get:
*       description: Get all the orders list
*       responses:
*           200: 
*               description: A list of JSON array of personal order
*       tags:
*           - Order
*/
orderRouter.get('/',async(req,res) => {
    try {
        const order = await Order.find();
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /order/{orderId}:
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
*               description: A JSON array of order
*       tags:
*           - Order
*/
orderRouter.get('/:orderId',async(req,res) => {
    try {
        const { orderId } = req.params;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const order = await Order.findById(orderId);
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /order:
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
*                           deliveryDate:
*                               type: string
*                           pickupDate:
*                               type: string
*                           type:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of requested order
*       tags:
*           - Order
*/
orderRouter.post('/', async(req,res) => {
    try {
        let {product, ordererId, shipping, mileageUse, coupon, payment} = req.body;
        if (!product) return res.status(400).send({err: "product is required"})
        if (!ordererId) return res.status(400).send({err: "ordererId is required"})
        if (!isValidObjectId(ordererId)) return res.status(400).send({err: "invalid ordererId id"})
        if (!shipping) return res.status(400).send({err: "shipping is required"})
        if (!payment) return res.status(400).send({err: "payment is required"})
        let orderer = await User.findById(ordererId)
        if (!orderer) return res.status(400).send({err: "invalid orderer"})
        if (mileageUse > orderer.mileage) return res.status(400).send({err: "mileage use should not be more than the order's mileage"})
        const order = new Order({ ...req.body,orderer });
        await Promise.all([
            order.save(),
            User.updateOne({ _id: ordererId }, { $push: { orders: order }})
        ]);
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /order/{orderId}:
*   put:
*       description: modify order
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
*                           status:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of requested order
*       tags:
*           - Order
*/
orderRouter.put('/:orderId', async(req,res) => {
    try {
        const { orderId } = req.params;
        const { shipping, status } = req.body;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const order = await Order.findByIdAndUpdate(orderId, {$set: {shipping, status}},{new: true});
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /order/{orderId}:
*   delete:
*       description: delete an order
*       parameters:
*           - name: orderId
*             in: path     
*             description: id of order
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted order
*       tags:
*           - Order
*/
orderRouter.delete('/:orderId', async(req,res) => {
    try {
        const { orderId } = req.params;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const order = await Order.findByIdAndRemove(orderId);
        if (!order) return res.status(400).send({err: "Invalid order id"})
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { orderRouter };