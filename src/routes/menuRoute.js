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

module.exports = {menuRouter};
