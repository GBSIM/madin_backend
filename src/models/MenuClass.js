const {Schema, model, Types:{ ObjectId }} = require('mongoose');
const { MenuSchema } = require('./Menu');

const MenuClassSchema = new Schema({
    name: {type: String, required: true},
    intro: {type: String, required: true},
    menus: [MenuSchema],
}, {timestamps: true})

const menuClass = model('menuClass',MenuClassSchema);

module.exports = { menuClass, MenuClassSchema };