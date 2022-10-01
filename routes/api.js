const express = require('express');
const router = express.Router();
/**
* @openapi
* /api/hello:
*   get:
*       description: Welcome to swagger-jsdoc!
*       responses:
*           200: 
*               description: Returns a mysterious string.
*/
router.get('/hello', function (req, res, next) {
 const name = req.query.name || 'World';
 res.json({ message: `Hello ${name}` });
});
module.exports = router;