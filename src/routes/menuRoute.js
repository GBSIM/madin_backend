const { Router } = require('express');
const { MenuClass, Menu } = require('../models');
const { isValidObjectId } = require('mongoose');

const menuRouter = Router();

/**
* @openapi
* /menu:
*   get:
*       description: Get all the menus
*       responses:
*           200: 
*               description: A JSON array of menus
*       tags:
*           - Menu
*/
menuRouter.get('/',async(req,res) => {
    try {
        const menu = await Menu.find();
        return res.send({menu})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /menu/{menuId}:
*   get:
*       description: Get menu by menu id
*       parameters:
*           - name: menuId
*             in: path     
*             description: id of the menu
*             schema:
*               type: string
*       responses:
*           200: 
*               description: A JSON array of menu
*       tags:
*           - Menu
*/
menuRouter.get('/:menuId',async(req,res) => {
    try {
        const { menuId } = req.params;
        if (!isValidObjectId(menuId)) return res.status(400).send({err: "invalid menu id"})
        const menu = await Menu.findById({menuId});
        return res.send({menu})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /menu:
*   post:
*       description: add menu
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           name:
*                               type: string
*                           price:
*                               type: number
*                           tag:
*                               type: string
*                           menuClassId:
*                               type: string
*                           stock:
*                               type: number
*                           pickupEn:
*                               type: boolean
*                           deliveryEn:
*                               type: boolean
*       responses:
*           200: 
*               description: Returns the added menu
*       tags:
*           - Menu
*/
menuRouter.post('/', async(req,res) => {
    try {
        let {name, price, tag, menuClassId, stock, pickupEn, deliveryEn} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!price) return res.status(400).send({err: "price is required"})
        if (!tag) return res.status(400).send({err: "tag is required"})
        if (!menuClassId) return res.status(400).send({err: "menu class id is required"})
        if (!stock) return res.status(400).send({err: "stock is required"})
        if (!pickupEn) return res.status(400).send({err: "pickupEn is required"})
        if (!deliveryEn) return res.status(400).send({err: "deliveryEn is required"})
        let menuClass = await MenuClass.findById(menuClassId);
        if (!menuClass) return res.status(400).send({err: "Invalid menu class"})
        const menu = new Menu({ ...req.body,menuClass });
        await Promise.all([
            menu.save(),
            MenuClass.updateOne({ _id: menuClassId }, { $push: { menus: menu }})
        ]);
        return res.send({menu})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});


/**
* @openapi
* /menu/{menuId}:
*   delete:
*       description: delete an menu
*       parameters:
*           - name: menuId
*             in: path     
*             description: id of menu
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted menu
*       tags:
*           - Menu
*/
menuRouter.delete('/:menuId', async(req,res) => {
    try {
        const { menuId } = req.params;
        if (!isValidObjectId(menuId)) return res.status(400).send({err: "invalid menu id"})
        const menu = await Menu.findByIdAndRemove(menuId);
        if (!menu) return res.status(400).send({err: "Invalid menu"})
        await MenuClass.updateOne(
            { "menus._id":menuId},
            { $pull: { menus: {_id: menuId}}});
        return res.send({menu})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

/**
* @openapi
* /menu/{menuId}:
*   patch:
*       description: modify menu information
*       parameters:
*           - name: menuId
*             in: path     
*             description: id of the menu
*             schema:
*               type: string
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           name:
*                               type: string
*                           price:
*                               type: number
*                           tag:
*                               type: string
*                           stock:
*                               type: number
*                           pickupEn:
*                               type: boolean
*                           deliveryEn:
*                               type: boolean
*                           imageUrl:
*                               type: string
*       responses:
*           200: 
*               description:  A JSON object of modified menu
*       tags:
*           - Menu
*/
menuRouter.patch('/:menuId', async(req,res) => {
    try {
        const { menuId } = req.params;
        const { name, price, tag, pickupEn, deliveryEn, stock, imageUrl } = req.body;
        if (!isValidObjectId(menuId)) return res.status(400).send({err: "invalid menu id"})
        const menu = await Menu.findByIdAndUpdate(menuId, {$set: {name, price, tag, pickupEn, deliveryEn, imageUrl}},{new: true});
        await MenuClass.updateOne(
            { 'menus._id': menuId }, 
            { "menus.$.name":name, "menus.$.price":price, 
              "menus.$.tag": tag, "menus.$.pickupEn": pickupEn, 
              "menus.$.deliveryEn": deliveryEn,
              "menus.$.stock": stock,
              "menus.$.imageUrl": imageUrl,})
        return res.send({menu})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {menuRouter};
