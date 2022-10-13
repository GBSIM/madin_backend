const {Schema, model, Types:{ ObjectId }} = require('mongoose');

const ShippingSchema = new Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    request: {type: String, required: true, default: ""},
    tag: {type: String, required: true, default: "배송지"},
    userId: {type: ObjectId, required: true, ref: "user"},
}, {timestamps: true})

const Shipping = model('shipping',ShippingSchema);

module.exports = { Shipping, ShippingSchema };