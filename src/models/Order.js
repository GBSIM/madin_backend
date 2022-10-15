const { Schema, model, Types:{ ObjectId } } = require('mongoose');
const { MenuSchema } = require('./Menu');

const OrderSchema = new Schema({
    menus: [MenuSchema],
    orderer: {
        _id: {type: ObjectId, required: true, ref: "user"},
        username: {type: String, required: true},
        phone: {type: String, required: true},
        email: {type: String, required: true}
    },
    shipping: {
        _id: {type: ObjectId, required: true, ref: "shipping"},
        name: {type: String, required: true},
        phone: {type: String, required: true},
        address: {type: String, required: true},
        request: {type: String, required: true},
        tag: {type: String, required: true},
    },
    mileageUse: {type: Number, required: true, default: 0},
    coupon: {type: ObjectId, ref: "coupon"},
    payment: {type: String, required: true},
    deliveryDate: {type: Date},
    pickupDate: {type: Date},
    type: {type: String, required: true, default: "개인"},
    status: {type: String, required: true, default: "결제완료"},
    orderPrice: {type: Number, required: true},
    payedMoney: {type: Number, required: true},
}, { timestamps: true});

const Order = model('order', OrderSchema);
module.exports = { Order, OrderSchema};