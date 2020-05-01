const express       = require("express");
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const Admin         = require('../models/admin');
const User          = require('../models/user');
const Functions     = require('../utils/functions');
const MiddleWares   = require('../config/middlewares');

const router        = express.Router();

const SECRET_KEY    = require('../utils/constants').ADMIN_SECRET_KEY;
const ADMIN_REG_PASSWORD    = require('../utils/constants').ADMIN_REG_PASSWORD;


router.post("/auth", (req, res) => {
     
    async function loginAdmin(){

        let data = req.body;

        if (Functions.hasOwnProperties(data, ['username', 'password'])){

            let admin = await Admin.findOne({ where: {username: data.username}});
                
            if (admin && bcrypt.compareSync(data.password, admin.dataValues.password)){
                const expiresIn  =  24  *  60  *  60;
                const accessToken  =  jwt.sign({ id:  admin.dataValues.id },  SECRET_KEY, {
                    expiresIn:  expiresIn
                });
                admin.password = undefined;
                res.status(200).json({status:'success', result: {data: {token: accessToken, admin: admin}}});
            }
            else{
                res.status(500).json({
                    status: "failed",
                    result: { message: "invalid login credentials!"}
                });
            }
        }
        else{
            res.status(500).json({status: 'failed', result: {message: "you passed in invalid arguments.. we require an username and a password!."}});
        }

    }

    loginAdmin();
  
});

router.post("/", (req, res)=>{

  let data = req.body;

  if (Functions.hasOwnProperties(data, ['firstname', 'lastname', 'username','password', 'reg_pass'])){
      if (data.reg_pass == ADMIN_REG_PASSWORD){
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(data.password, salt, (err, hash)=>{
                Admin.create({
                    firstname: data.firstname.trim(),
                    lastname: data.lastname,
                    othername: data.othername,
                    username: data.username.trim(),
                    password: hash,
                }).then((admin)=>{
                    res.status(200).json({status: 'success', result: {data: admin}});
                }).catch((err)=>{
                    res.status(500).json({status: 'failed', result: {message: 'unable to create account', error: err}});
                });
            });
        });
    }
    else{
      res.status(500).json({status: 'failed', result: {message: "invalid registration password!."}});
    }
  }
  else{
      res.status(500).json({status: 'failed', result: {message: "you passed in invalid arguments.. we require a firstname, lastname, email, phone and password!."}});
  }
});

router.get("/users", MiddleWares.adminAuthRequired, (req, res)=>{
	User.findAll({ where: { } }).then((users) => {
        res.status(200).json({status: 'success', result: { data: users }});       
    }).catch((err) => {
        res.status(500).json({status: 'failed', result: {message: 'unable to get users', error: err}});
    });
});


router.get("/users/:id", MiddleWares.adminAuthRequired, (req, res)=>{
	User.findOne({ where: {id: id}}).then((user) => {
        res.status(200).json({status: 'success', result: { data: user }});       
    }).catch((err) => {
        res.status(500).json({status: 'failed', result: {message: 'unable to get user', error: err}});
    });
});


router.delete("/users/:id", MiddleWares.adminAuthRequired, (req, res)=>{
    User.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted user successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete user', error: err}});
    });
});


router.get("/", MiddleWares.adminAuthRequired, (req, res)=>{
  req.admin.password = undefined;
  res.status(200).json({status: 'success', result:{data: req.admin}});
});

router.delete("/", MiddleWares.adminAuthRequired, (req, res)=>{
  Admin.destroy({
      where: {
        id: req.admin.id
      }
  }).then(() => {
      res.status(200).json({status: 'success', result: {message: 'deleted admin successfully'}});
  }).catch((err)=>{ 
      res.status(500).json({status: 'failed', result: {message: 'unable to delete admin', error: err}});
  });
});

router.put("/", MiddleWares.adminAuthRequired, (req, res)=>{
  if (req.body.hasOwnProperty('password')){
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
  }
  //cleaning update object
  req.body.id = undefined;
  req.body.createdAt = undefined;
  req.body.updatedAt = undefined;

  Admin.update(req.body, {
      where: {
        id: req.admin.id
      }
  }).then(() => {
      res.status(200).json({status: 'success', result: {message: 'updated admin successfully'}});
  }).catch((err)=>{ 
      res.status(500).json({status: 'failed', result: {message: 'unable to update admin details', error: err}});
  });
});


module.exports = router;