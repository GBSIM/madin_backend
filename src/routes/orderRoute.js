const { Router } = require('express');
const { User, Order, Shipping } = require('../models');
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
* /order/{ordererId}:
*   post:
*       description: Order
*       parameters:
*           - name: ordererId
*             in: path     
*             description: id of orderer
*             schema:
*               type: string       
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
*                           shippingId:
*                               type: string
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
*                           orderPrice:
*                               type: number
*                           payedMoney:
*                               type: number
*       responses:
*           200: 
*               description:  A JSON object of requested order
*       tags:
*           - Order
*/
orderRouter.post('/:ordererId', async(req,res) => {
    try {
        const { ordererId } = req.params;
        let {product, shippingId, mileageUse, coupon, payment, orderPrice, payedMoney} = req.body;
        if (!product) return res.status(400).send({err: "product is required"})
        if (!ordererId) return res.status(400).send({err: "ordererId is required"})
        if (!isValidObjectId(ordererId)) return res.status(400).send({err: "invalid ordererId id"})
        if (!shippingId) return res.status(400).send({err: "shippingId is required"})
        if (!payment) return res.status(400).send({err: "payment is required"})
        let orderer = await User.findById(ordererId)
        if (!orderer) return res.status(400).send({err: "invalid orderer"})
        if (!orderPrice) return res.status(400).send({err: "orderPrice is required"})
        if (!payedMoney) return res.status(400).send({err: "payedMoney is required"})
        if (mileageUse > orderer.mileage) return res.status(400).send({err: "mileage use should not be more than the order's mileage"})
        let shipping = await Shipping.findById(shippingId);
        if (!shipping) return res.status(400).send({err: "invalid shipping"})
        const order = new Order({ ...req.body,orderer,shipping });
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
*   patch:
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
*                           deliveryDate:
*                               type: string
*                           pickupDate:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of requested order
*       tags:
*           - Order
*/
orderRouter.patch('/:orderId', async(req,res) => {
    try {
        const { orderId } = req.params;
        const { shipping, status, deliveryDate, pickupDate } = req.body;
        if (!isValidObjectId(orderId)) return res.status(400).send({err: "invalid order id"})
        const order = await Order.findByIdAndUpdate(orderId, {$set: {shipping, status, deliveryDate, pickupDate}},{new: true});
        await User.updateOne(
            { 'orders._id': orderId }, 
            { "orders.$.shipping":shipping, "orders.$.status":status, "orders.$.deliveryDate": deliveryDate, "orders.$.pickupDate": pickupDate})
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
        if (!order) return res.status(400).send({err: "Invalid order"})
        await User.updateOne(
            { "orders._id":orderId},
            { $pull: { orders: {_id: orderId}}});
        return res.send({order})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { orderRouter };