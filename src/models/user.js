const Sequelize = require('sequelize');
const bcrypt    = require('bcrypt-nodejs');
const db        = require('../config/database');

let _           = require('../utils/scripts/underscore.js');

const User = db.define('user', {
    // attributes
    firstname: {
      type: Sequelize.STRING,
	  allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
	  allowNull: false
    },
    othername:  {
        type: Sequelize.STRING,
    },
    email:  {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone:  {
        type: Sequelize.STRING,
		allowNull: false,
        unique: true
    },
    address:  {
        type: Sequelize.STRING
    },
    country:  {
        type: Sequelize.STRING
    },
    city:  {
        type: Sequelize.STRING
    },
    state:  {
        type: Sequelize.STRING,
    },  
    password:  {
        type: Sequelize.STRING,
        allowNull: false
    }
  }, {
    // options
  });

  module.exports = User;