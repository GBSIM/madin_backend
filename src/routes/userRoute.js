const { Router } = require('express');
const {User, Shipping} = require('../models');
const { isValidObjectId } = require('mongoose');
const { get, post } = require('axios');
const jwt = require('jsonwebtoken');

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
* /user/auth/{socialId}:
*   post:
*       description: Get user by social id
*       parameters:
*           - name: socialId
*             in: path     
*             description: social id of user
*             schema:
*               type: string
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string       
*       responses:
*           200: 
*               description: A JSON object of user
*       tags:
*           - User
*/
userRouter.post('/auth/:socialId', async(req,res) => {
    try {
        const { socialId } = req.params;
        const { token } = req.body;
        const user = await User.findOne({socialId: socialId});
        if (!user) return res.status(400).send({err: "no matched user"})
        if ( user.token !== token) return res.status(400).send({err: "token is wrong"})
        const currentTime = new Date();
        if ((user.token === token) && (currentTime > user.tokenExpiration)) return res.status(400).send({err: "token is expired"})
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
*                           socialId:
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
        if (!socialId) return res.status(400).send({err: "code is required"})
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
* /user/kakaologin:
*   post:
*       description: login with kakao social login service
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           code:
*                               type: string
*                           redirectUri:
*                               type: string
*       responses:
*           200: 
*               description: Returns the logined user
*       tags:
*           - User
*/
userRouter.post('/kakaologin', async(req,res) => {
    try {
        let {code,redirectUri} = req.body;
        if (!code) return res.status(400).send({err: "code is required"})
        if (!redirectUri) return res.status(400).send({err: "redirectUri is required"})

        const bodyData = {
            grant_type : "authorization_code",
            client_id : "c49e9d7fad13c64229c3899523a2ba6b",
            redirect_uri : redirectUri,
            code : code
        }
        const queryStringBody = Object.keys(bodyData)
            .map(k=> encodeURIComponent(k)+"="+encodeURI(bodyData[k]))
            .join("&")

        const responseToken = await post('https://kauth.kakao.com/oauth/token',
            queryStringBody
        );

        let accessToken = responseToken.data.access_token;

        const responseUserInfo = await get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        let socialId = 'kakao_'+responseUserInfo.data.id;
        let username = responseUserInfo.data.properties.nickname;
        let email = responseUserInfo.data.kakao_account.email;

        let user
        user = await User.findOne({socialId: socialId});
        if (!user) {
            user = new User({socialId, username, email});
            await user.save();
        }
        var token = jwt.sign(user._id.toHexString(), 'secretToken');
        user.token = token;
        const currentTime = new Date();
        user.tokenExpiration = currentTime.setHours(currentTime.getHours() + 2);
        await user.save();

        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /user/{userId}:
*   delete:
*       description: delete user's information
*       parameters:
*           - name: userId
*             in: path     
*             description: id of user
*             schema:
*               type: string       
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string       
*       responses:
*           200: 
*               description: Returns the deleted user
*       tags:
*           - User
*/
userRouter.delete('/:userId', async(req,res) => {
    try {
        const { userId } = req.params;
        const { token } = req.body;
        if (!isValidObjectId(userId)) return res.status(400).send({err: "invalid user id"})
        if (!token) return res.status(400).send({err: "token is required"})
        // const user = await User.findByIdAndDelete(userId);
        const user = await User.findById(userId);
        if (!user) return res.status(400).send({err: "no matched user"})
        if ( user.token !== token) return res.status(400).send({err: "token is wrong"})
        const currentTime = new Date();
        if ((user.token === token) && (currentTime > user.tokenExpiration)) return res.status(400).send({err: "token is expired"})
        await user.delete();
        await Shipping.deleteMany({ "userId":userId});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /user/{userId}:
*   patch:
*       description: Update the user's information
*       parameters:
*           - name: userId
*             in: path     
*             description: id of user
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
*                           phone:
*                               type: string
*                           username:
*                               type: string
*                           token:
*                               type: string       
*       responses:
*           200: 
*               description: Returns the updated user
*       tags:
*           - User
*/
userRouter.patch('/:userId', async(req,res) => {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId)) return res.status(400).send({err: "invalid user id"})
        const { profileImageUrl, email, phone, username, token } = req.body;
        let user;
        user = await User.findById(userId);
        if (!user) return res.status(400).send({err: "no matched user"})
        if ( user.token !== token) return res.status(400).send({err: "token is wrong"})
        const currentTime = new Date();
        if ((user.token === token) && (currentTime > user.tokenExpiration)) return res.status(400).send({err: "token is expired"})
        user = await User.findOneAndUpdate({_id: userId}, {$set: {profileImageUrl,email,phone,username}},{new: true});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {userRouter};