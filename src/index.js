require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');
const { createAccessToken, 
        createRefreshToken,
        sendAccessToken,
        sendRefreshToken
     } = require('./tokens.js');

const { fakeDB } = require('./fakeDB.js');

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


//1. Register a user
server.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        //1. Check if user exist
        const user = fakeDB.find(user => user.email === email);
        if (user) throw new Error("User already exist");
        //2. If not user exist, hash the password
        const hashedPassword = await hash(password, 10);
        //3. Insert the user in "database"
        fakeDB.push({
            id: fakeDB.length,
            email,
            password: hashedPassword
        });
        res.send({ message: 'User Created'});
        console.log(fakeDB);

    } catch(err) {
        res.send({
            error: `${err.message}`
        });
    }

})

//2. Login a user
server.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        //1. Check if user exist. If not throw error
        const user = fakeDB.find(user => user.email === email);
        if(!user) throw new Error("User does not exist");
        //2. Compare crypted password and see if it checks out. Send error if not
        const valid = await compare(password, user.password);
        if(!valid) throw new Error("Password not correct");
        //3. Create Refresh and Access token
        const accesstoken = createAccessToken(user.id);
        const refreshtoken = createRefreshToken(user.id);
        //4. Put the refreshtoken in "database"
        user.refreshtoken = refreshtoken;
        console.log(fakeDB);
        //5. Send token. RefreshToken as a cookie and AccessToken as a regular response
        sendRefreshToken(res, refreshtoken);
        sendAccessToken(req, res, accesstoken);
        
    } catch(err) {
        res.send({
            error: `${err.message}`
        })
    }
})


server.listen(process.env.PORT, () => 
    console.log(`Server listening on port ${process.env.PORT}`)
);