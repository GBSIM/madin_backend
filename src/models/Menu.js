const {Schema, model, Types:{ ObjectId }} = require('mongoose');

const MenuSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    tag: String,
    menuClass: {
        _id: {type: ObjectId, required: true, ref: 'menuClass'},
        name: {type: String, required: true},
    },
    stock: {type: Number, required: true, default: 0},
    pickupEn: {type: Boolean, required: true, default: false},
    deliveryEn: {type: Boolean, required: true, default: false},
    presentEn: {type: Boolean, required: true, default: false},
    quantity: Number,
    imageUrl: String
}, {timestamps: true})

const Menu = model('menu',MenuSchema);

module.exports = { Menu, MenuSchema };