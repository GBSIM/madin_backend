const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    username: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    phone: { type: String, required: true, default: "01000000000"},
    profileImageUrl: String,
    code: { type: String, required: true, unique: true},
}, {timestamps: true})

const User = model('user',UserSchema);

module.exports = { User };