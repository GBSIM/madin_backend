const { Schema, model, Types } = require('mongoose');

const PersonalOrderSchema = new Schema({
    product: { type: Array, required: true},
    orderer: { type: Types.ObjectId, required: true, ref: "user"},
    shipping: {
        name: {type: String, required: true},
        phone: {type: String, required: true},
        address: {type: String, required: true},
        request: String,
    },
    mileageUse: {type: Number, required: true, default: 0},
    coupon: {type: Types.ObjectId, ref: "coupon"},
    payment: {type: String, required: true},
    status: {type: String, required: true, default: "결제완료"}
}, { timestamps: true});

const PersonalOrder = model('personalorder', PersonalOrderSchema);
module.exports = { PersonalOrder };