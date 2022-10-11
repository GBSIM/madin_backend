const {Schema, model} = require('mongoose');
const { OrderSchema } = require('./Order');

const UserSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    phone: { type: String, required: true, default: "01000000000"},
    profileImageUrl: String,
    code: { type: String, required: true, unique: true},
    mileage: { type: Number, required: true, default: 0},
    shipping: {type: Array, required: true, default: []},
    orders: [OrderSchema],
}, {timestamps: true})

const User = model('user',UserSchema);

module.exports = { User, UserSchema };