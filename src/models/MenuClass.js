const {Schema, model, Types:{ ObjectId }} = require('mongoose');
const { MenuSchema } = require('./Menu');

const MenuClassSchema = new Schema({
    name: {type: String, required: true},
    intro: {type: String, required: true},
    menus: [MenuSchema],
    orderType: {type: String, default: 'delivery'},
}, {timestamps: true})

const MenuClass = model('menuClass',MenuClassSchema);

module.exports = { MenuClass, MenuClassSchema };