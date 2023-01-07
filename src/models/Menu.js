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
    orderType: {type: String, default: 'delivery'},
    quantity: Number,
    option: Object,
    isChecked: {type: Boolean, default: true},
    imageUrl: String,
    intro: String,
    options: Array,
}, {timestamps: true})

const Menu = model('menu',MenuSchema);

module.exports = { Menu, MenuSchema };