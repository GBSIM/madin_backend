const { Router } = require('express');
const { MenuClass } = require('../models');
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
})

module.exports = {menuClassRouter};