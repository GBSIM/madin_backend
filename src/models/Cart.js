const { Schema, model, Types:{ ObjectId } } = require('mongoose');
const { MenuSchema } = require('./Menu');

const CartSchema = new Schema({
    menus: [MenuSchema],
    user: {
        _id: {type: ObjectId, required: true, ref: "user"},
        username: {type: String, required: true},
        phone: {type: String, required: true},
        email: {type: String, required: true}
    }
}, { timestamps: true});

const Cart = model('cart', CartSchema);
module.exports = { Cart, CartSchema};