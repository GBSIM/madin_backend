const {Schema, model, Types:{ ObjectId }} = require('mongoose');
const { MenuSchema } = require('./Menu');

const MenuClassSchema = new Schema({
    name: {type: String, required: true},
    intro: {type: String, required: true},
    menus: [MenuSchema],
    pickupEn: {type: Boolean, default: false},
    deliveryEn: {type: Boolean, default: false},
    presentEn: {type: Boolean, default: false},
}, {timestamps: true})

const MenuClass = model('menuClass',MenuClassSchema);

module.exports = { MenuClass, MenuClassSchema };