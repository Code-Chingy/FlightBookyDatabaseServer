const express       = require("express");
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const User          = require('../models/user');
const Functions     = require('../utils/functions');
const MiddleWares   = require('../config/middlewares');

const router        = express.Router();

const SECRET_KEY    = require('../utils/constants').USER_SECRET_KEY;


router.post("/auth", (req, res) => {
     
    async function loginUser(){

        let data = req.body;

        if (Functions.hasOwnProperties(data, ['email', 'password'])){

            let user = await User.findOne({ where: {email: data.email}});
                
            if (user && bcrypt.compareSync(data.password, user.dataValues.password)){
                const expiresIn  =  24  *  60  *  60;
                const accessToken  =  jwt.sign({ id:  user.dataValues.id },  SECRET_KEY, {
                    expiresIn:  expiresIn
                });
                user.password = undefined;
                res.status(200).json({status:'success', result: {data: {token: accessToken, user: user}}});
            }
            else{
                res.status(500).json({
                    status: "failed",
                    result: { message: "invalid login credentials!"}
                });
            }
        }
        else{
            res.status(500).json({status: 'failed', result: {message: "you passed in invalid arguments.. we require an email and a password!."}});
        }

    }

    loginUser();
  
});

router.post("/", (req, res)=>{

    let data = req.body;

    if (Functions.hasOwnProperties(data, ['firstname', 'lastname', 'email', 'phone', 'password'])){
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(data.password, salt, (err, hash)=>{
                User.create({
                    firstname: data.firstname.trim(),
                    lastname: data.lastname.trim(),
                    othername: data.othername,
                    email: data.email.trim(),
                    phone: data.phone.trim(),
                    password: hash,
                }).then((user)=>{
                    res.status(200).json({status: 'success', result: {data: user}});
                }).catch((err)=>{
                    res.status(500).json({status: 'failed', result: {message: 'unable to create account', error: err}});
                });
            });
        });
    }
    else{
        res.status(500).json({status: 'failed', result: {message: "you passed in invalid arguments.. we require a firstname, lastname, email, phone and password!."}});
    }

});

router.get("/", MiddleWares.userAuthRequired, (req, res)=>{
    req.user.password = undefined;
    res.status(200).json({status: 'success', result:{data: req.user}});
});

router.delete("/", MiddleWares.userAuthRequired, (req, res)=>{
    User.destroy({
        where: {
            id: req.user.id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted user successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete user', error: err}});
    });
});

router.put("/", MiddleWares.userAuthRequired, (req, res)=>{
    if (req.body.hasOwnProperty('password')){
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash;
    }
    //cleaning update object
    req.body.id = undefined;
    req.body.createdAt = undefined;
    req.body.updatedAt = undefined;

    User.update(req.body, {
        where: {
            id: req.user.id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'updated user successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to update user details', error: err}});
    });
});


module.exports = router;