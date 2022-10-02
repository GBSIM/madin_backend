const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

const app = express();
app.use(express.json());

const MONGO_URI = 'mongodb+srv://' + 
                  process.env.MONGODB_USER + ':' + 
                  process.env.MONGODB_PASSWORD + 
                  '@madin.o0tnhkc.mongodb.net/?retryWrites=true&w=majority';

const SWAGGER_OPTIONS = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Madin backend api',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'],
};

const openapiSpec = swaggerJsdoc(SWAGGER_OPTIONS);

const server = async() => {
    try {
        let mongodbConnection = await mongoose.connect(MONGO_URI);
        console.log('Mongo DB connected!');
        
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
        app.use('/api',require('../routes/api'));
        app.listen(3000, function() {
            console.log('server listening on port 3000');
        })
    } catch(err) {
        console.log(err);
    }
}

server();