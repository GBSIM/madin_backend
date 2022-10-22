const { Router } = require('express');
const {User, Shipping} = require('../models');
const { isValidObjectId } = require('mongoose');
const { get, post } = require('axios');

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
* /user/kakao:
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
*       responses:
*           200: 
*               description: Returns the logined user
*       tags:
*           - User
*/
userRouter.post('/kakao', async(req,res) => {
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

        let id = 'kakao_'+responseUserInfo.data.id;
        let username = responseUserInfo.data.properties.nickname;
        let email = responseUserInfo.data.kakao_account.email;

        const user = await User.findOne({code: id});
        if (!user) {
            const newUser = new User({code: id, username, email});
            await newUser.save();
        }

        return res.send({accessToken})
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
*       responses:
*           200: 
*               description: Returns the deleted user
*       tags:
*           - User
*/
userRouter.delete('/:userId', async(req,res) => {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId)) return res.status(400).send({err: "invalid user id"})
        const user = await User.findByIdAndDelete(userId);
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
        const { profileImageUrl, email, phone, username } = req.body;
        const user = await User.findOneAndUpdate({_id: userId}, {$set: {profileImageUrl,email,phone,username}},{new: true});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {userRouter};

const KakaoRedirectHandler = (code,redirectUri) => {
    let grant_type = "authorization_code";
    let client_id = "c49e9d7fad13c64229c3899523a2ba6b";

    axios.post(`https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${client_id}&redirect_uri=${redirectUri}&code=${code}`
        , {
    headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }).then((res) => {
        window.Kakao.Auth.setAccessToken(res.data.access_token);
        window.Kakao.API.request({
            url: "/v2/user/me",
    }).then(async(data) => {
        const userGetResponse = await axios.get('https://api.madinbakery.com/user/'+data.id);
        window.history.replaceState({}, null, window.location.pathname);
        if (!userGetResponse.data.user) {
        await axios.post('https://api.madinbakery.com/user',{
            "code": data.id,
            "username": data.properties.nickname,
            "email": data.kakao_account.email
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        })}
        }       
    )})
};