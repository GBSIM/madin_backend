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
*       description: Get all the shippings of the specific user
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
})

module.exports = {menuClassRouter};