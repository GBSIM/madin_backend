const { Router } = require('express');
const { MenuClass, Menu } = require('../models');
const { isValidObjectId } = require('mongoose');

const menuClassRouter = Router();

/**
* @openapi
* /menuclass:
*   get:
*       description: Get all the menu classes
*       responses:
*           200: 
*               description: A JSON array of menu classes
*       tags:
*           - MenuClass
*/
menuClassRouter.get('/',async(req,res) => {
    try {
        const menuClass = await MenuClass.find();
        return res.send({menuClass})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /menuclass/{menuClassId}:
*   get:
*       description: Get the menu class by id
*       parameters:
*           - name: menuClassId
*             in: path     
*             description: id of the menu class
*             schema:
*               type: string
*       responses:
*           200: 
*               description: A JSON array of menu class
*       tags:
*           - MenuClass
*/
menuClassRouter.get('/:menuClassId',async(req,res) => {
    try {
        const { menuClassId } = req.params;
        if (!isValidObjectId(menuClassId)) return res.status(400).send({err: "invalid menu class id"})
        const menuClass = await Menu.findById({menuClassId});
        return res.send({menuClass})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /menuclass:
*   post:
*       description: add menu class
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                       type: object
*                       properties:
*                           name:
*                               type: string
*                           intro:
*                               type: string
*                           pickupEn:
*                               type: boolean
*                           deliveryEn:
*                               type: boolean
*                           presentEn:
*                               type: boolean
*       responses:
*           200: 
*               description: Returns the added menu class
*       tags:
*           - MenuClass
*/
menuClassRouter.post('/', async(req,res) => {
    try {
        let {name, intro, pickupEn, deliveryEn, presentEn} = req.body;
        if (!name) return res.status(400).send({err: "name is required"})
        if (!intro) return res.status(400).send({err: "intro is required"})
        const menuClass = new MenuClass(req.body);
        await menuClass.save();
        return res.send({menuClass})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

/**
* @openapi
* /menuclass/{menuClassId}:
*   delete:
*       description: delete menu class
*       parameters:
*           - name: menuClassId
*             in: path     
*             description: id of menu class
*             schema:
*               type: string       
*       responses:
*           200: 
*               description: Returns the deleted menu class
*       tags:
*           - MenuClass
*/
menuClassRouter.delete('/:menuClassId', async(req,res) => {
    try {
        const { menuClassId } = req.params;
        if (!isValidObjectId(menuClassId)) return res.status(400).send({err: "invalid menu class id"})
        const menuClass = await MenuClass.findByIdAndDelete(menuClassId);
        await Menu.deleteMany({ "menuClass._id":menuClassId});
        return res.send({menuClass})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})


/**
* @openapi
* /menuclass/{menuClassId}:
*   patch:
*       description: Update the menu class information
*       parameters:
*           - name: menuClassId
*             in: path     
*             description: id of menu class
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
*                           intro:
*                               type: string
*                           pickupEn:
*                               type: string
*                           deliveryEn:
*                               type: string
*                           presentEn:
*                               type: string
*       responses:
*           200: 
*               description: Returns the updated menu class
*       tags:
*           -  MenuClass
*/
menuClassRouter.patch('/:menuClassId', async(req,res) => {
    try {
        const { menuClassId } = req.params;
        if (!isValidObjectId(menuClassId)) return res.status(400).send({err: "invalid menu class id"})
        const { name, intro, pickupEn, deliveryEn, presentEn } = req.body;
        const menuClass = await MenuClass.findByIdAndUpdate(menuClassId, {$set: {name,intro,pickupEn,deliveryEn,presentEn}},{new: true});
        return res.send({menuClass})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = {menuClassRouter};