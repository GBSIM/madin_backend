const { Router } = require('express');
const {User, Shipping, Menu} = require('../models');
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
* /user/auth:
*   post:
*       description: Get user by social id
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
userRouter.post('/auth', async(req,res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({token: token});
        if (!user) return res.status(400).send({err: "no matched user"})
        const currentTime = new Date();
        if ((user.token === token) && (currentTime > user.tokenExpiration)) return res.status(400).send({err: "token is expired"})
        user.socialId = "";
        user.socialToken = "";
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
*                           name:
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
        let {name, email, socialId} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!email) return res.status(400).send({err: "email is required"})
        if (!socialId) return res.status(400).send({err: "socialId is required"})
        const user = new User(req.body);
        await user.save().then(() => {
            user.socialToken = "";
            user.token = "";
            user.socialId = "";
        });
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

        const accessToken = responseToken.data.access_token;
        const socialToken = accessToken; 

        const responseUserInfo = await get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        let socialId = 'kakao_'+responseUserInfo.data.id;
        let name = responseUserInfo.data.properties.nickname;
        let email = responseUserInfo.data.kakao_account.email;

        let user
        user = await User.findOne({socialId: socialId});
        if (!user) {
            user = new User({socialId, name, email, socialToken});
            await user.save();
        } else {
            user.socialToken = socialToken;
            await user.save();
        }
        
        const currentTime = new Date();
        var token = await jwt.sign(user._id.toHexString() + currentTime.toString(), 'secretToken');
        user.token = token;
        user.tokenExpiration = currentTime.setHours(currentTime.getHours() + 2);
        await user.save().then(() => {
            user.socialToken = "";
            user.socialId = "";
        });
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /user/logout:
*   post:
*       description: logout with kakao social login service
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
*               description: Returns the logoutted user
*       tags:
*           - User
*/
userRouter.post('/logout', async(req,res) => {
    try {
        let { token } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        
        const user = await User.findOne({token: token});
        if (!user) return res.status(400).send({err: "no matched user"})
        if (!user.socialToken) return res.status(400).send({err: "accessToken does not exist in user db"})

        await post('https://kapi.kakao.com/v1/user/logout',{},{
            headers: {
                Authorization: `Bearer ${user.socialToken}`,
            },
        });
        
        user.socialToken = "";
        user.token = "";
        user.tokenExpiration = "";
        await user.save();

        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /user/cart:
*   post:
*       description: add menu to user's cart
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string
*                           menuId:
*                               type: string
*                           quantity:
*                               type: number
*       responses:
*           200: 
*               description: Returns the user
*       tags:
*           - User
*/
userRouter.post('/cart', async(req,res) => {
    try {
        let { token, menuId, quantity } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        if (!menuId) return res.status(400).send({err: "menuId is required"})
        if (!quantity) return res.status(400).send({err: "quantity is required"})
        
        const user = await User.findOne({token: token});
        if (!user) return res.status(400).send({err: "no matched user"})
        
        const menu = await Menu.findById(menuId);
        if (!menu) return res.status(400).send({err: "no matched menu"})

        menu.quantity = quantity;
        menu.isChecked = true;

        let isMenuInCart = false;
        const cart = user.cart;
        cart.map(async(cartMenu, index) => {
            if (cartMenu._id.toString() === menuId) {
                if (quantity > 0) {
                    cartMenu.quantity = cartMenu.quantity + quantity;
                } else {
                    if (cartMenu.quantity > 0) {
                        cartMenu.quantity = cartMenu.quantity + quantity;
                    }
                }
                if (cartMenu.quantity === 0) {
                    cart.splice(index,1);
                }
                isMenuInCart = true;
                await user.save().then(() => {
                    user.socialToken = "";
                    user.socialId = "";
                    user.token = "";
                });
            }
        })

        if (!isMenuInCart) {
            if (menu.quantity > 0) {
                user.cart.push(menu);
                await user.save().then(() => {
                    user.socialToken = "";
                    user.socialId = "";
                    user.token = "";
                });
            }
        }
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /user/cart:
*   patch:
*       description: update menu to user's cart
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string
*                           menuId:
*                               type: string
*                           isChecked:
*                               type: boolean
*                           isAllMenus:
*                               type: boolean
*       responses:
*           200: 
*               description: Returns the user
*       tags:
*           - User
*/
userRouter.patch('/cart', async(req,res) => {
    try {
        let { token, menuId, isChecked, isAllMenus } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        if (!menuId) return res.status(400).send({err: "menuId is required"})
        
        const user = await User.findOne({token: token});
        if (!user) return res.status(400).send({err: "no matched user"})

        if (isAllMenus) {
            cart.map(async(cartMenu) => {
                cartMenu.isChecked = isChecked;
                await user.save().then(() => {
                    user.socialToken = "";
                    user.socialId = "";
                    user.token = "";
                });
            })
        } else {
            cart.map(async(cartMenu) => {
                if (cartMenu._id.toString() === menuId) {
                    cartMenu.isChecked = isChecked;
                    await user.save().then(() => {
                        user.socialToken = "";
                        user.socialId = "";
                        user.token = "";
                    });
                }
            })
        }
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /user/cart:
*   delete:
*       description: delete menu from user's cart
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           token:
*                               type: string
*                           menuId:
*                               type: string
*       responses:
*           200: 
*               description: Returns the user
*       tags:
*           - User
*/
userRouter.delete('/cart', async(req,res) => {
    try {
        let { token, menuId } = req.body;
        if (!token) return res.status(400).send({err: "token is required"})
        if (!menuId) return res.status(400).send({err: "menuId is required"})
        
        const user = await User.findOne({token: token});
        if (!user) return res.status(400).send({err: "no matched user"})
        
        const menu = await Menu.findById(menuId);
        if (!menu) return res.status(400).send({err: "no matched menu"})

        const cart = user.cart;
        cart.map(async(cartMenu, index) => {
            if (cartMenu._id.toString() === menuId) {
                cart.splice(index,1);
                await user.save().then(() => {
                    user.socialToken = "";
                    user.socialId = "";
                    user.token = "";
                });
            }
        })
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
*                           name:
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
        const { profileImageUrl, email, phone, name, token } = req.body;
        let user;
        user = await User.findById(userId);
        if (!user) return res.status(400).send({err: "no matched user"})
        if ( user.token !== token) return res.status(400).send({err: "token is wrong"})
        const currentTime = new Date();
        if ((user.token === token) && (currentTime > user.tokenExpiration)) return res.status(400).send({err: "token is expired"})
        user = await User.findOneAndUpdate({_id: userId}, {$set: {profileImageUrl,email,phone,name}},{new: true});
        user.socialToken = "";
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {userRouter};