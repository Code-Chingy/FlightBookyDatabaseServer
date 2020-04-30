const Sequelize = require('sequelize');

const db        = require('../config/database');

const Reservation = db.define('reservation', {
    userID: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: false
    },
    flightID:{
        type: Sequelize.INTEGER,
        references: {
            model: 'flights',
            key: 'id'
        },
        allowNull: false
    },
    reservationStatus: {
        type: Sequelize.STRING,
        defaultValue: 'not-complete',
        validate: {
            isIn: {
                args: [['complete', 'not-complete']],
                msg: "reservation status must be in ['complete', 'not-complete']"
            }
        }
    },
    travelClass: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['coach', 'economy', 'first-class', 'premium-economy', 'business']],
                msg: "travel class must be in ['coach', 'economy', 'first-class', 'premium-economy', 'business']"
            }
        }
    },
    numberOfPersons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    paymentAmount: {
        type: Sequelize.FLOAT
    },
    paymentDate: {
        type: Sequelize.DATE
    },
});


module.exports = Reservation;