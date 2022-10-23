const {Schema, model} = require('mongoose');
const { OrderSchema } = require('./Order');
const { ShippingSchema } = require('./Shipping');

const UserSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    phone: { type: String, required: true, default: "01000000000"},
    profileImageUrl: String,
    socialId: { type: String, required: true, unique: true},
    mileage: { type: Number, required: true, default: 0},
    shippings: [ShippingSchema],
    orders: [OrderSchema],
}, {timestamps: true})

const User = model('user',UserSchema);

module.exports = { User, UserSchema };