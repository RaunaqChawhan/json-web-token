require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');

const server = express();

//Use express middleware for easier cookie handling
server.use(cookieParser());

server.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

//Needed to be able to read body data
server.use(express.json());

server.use(express.urlencoded({ extended: true})); //support URL encoded bodies


server.listen(process.env.PORT, () => 
    console.log(`Server listening on port ${process.env.PORT}`)
);