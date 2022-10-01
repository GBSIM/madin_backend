const express = require('express');

const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Madin backend api',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'],
};

const openapiSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api',require('./routes/api'));

app.listen(3000, function() {
    console.log('server listening on port 3000');
})