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
*               description: A JSON array of user
*       tags:
*           - User
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
* /user/{code}:
*   get:
*       description: Get user by id code
*       parameters:
*           - name: code
*             in: path     
*             description: code of user
*             schema:
*               type: string         
*       responses:
*           200: 
*               description: A JSON object of user
*       tags:
*           - User
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
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           username:
*                               type: string
*                           email:
*                               type: string
*                           code:
*                               type: string
*       responses:
*           200: 
*               description: Returns the registered user
*       tags:
*           - User
*/
userRouter.post('/', async(req,res) => {
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

/**
* @openapi
* /user/{code}:
*   delete:
*       description: delete user's information
*       parameters:
*           - name: code
*             in: path     
*             description: code of user
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted user
*       tags:
*           - User
*/
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
* /user/{code}:
*   put:
*       description: Update the user's information
*       parameters:
*           - name: code
*             in: path     
*             description: code of user
*             schema:
*               type: string
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           profileImageUrl:
*                               type: string
*                           email:
*                               type: string
*       responses:
*           200: 
*               description: Returns the updated user
*       tags:
*           - User
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