const { Router } = require('express');
const {User} = require('../models/User');

const userRouter = Router();

/**
* @openapi
* /user:
*   get:
*       description: Get all the users list
*       responses:
*           200: 
*               description: Returns the list of users
*/
userRouter.get('/',async(req,res) => {
    try {
        const user = await User.find();
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /user/:code:
*   get:
*       description: Get user by id code
*       responses:
*           200: 
*               description: Returns the user
*/
userRouter.get('/:code', async(req,res) => {
    try {
        const { code } = req.params;
        const user = await User.findOne({code: code});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /user:
*   post:
*       description: Signup user
*       responses:
*           200: 
*               description: Returns the registered user
*/

userRouter.post('/user', async(req,res) => {
    try {
        let {username, email, code} = req.body;
        if (!username) return res.status(400).send({err: "username is required"})
        if (!email) return res.status(400).send({err: "email is required"})
        if (!code) return res.status(400).send({err: "code is required"})
        const user = new User(req.body);
        await user.save();
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

userRouter.delete('/:code', async(req,res) => {
    try {
        const { code } = req.params;
        const user = await User.findOneAndDelete({code: code});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /user:
*   get:
*       description: Update the user's information
*       responses:
*           200: 
*               description: Returns the updated user
*/
userRouter.put('/:code', async(req,res) => {
    try {
        const { code } = req.params;
        const { profileImageUrl, email } = req.body;
        const user = await User.findOneAndUpdate({code: code}, {$set: {profileImageUrl,email}},{new: true});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {userRouter};