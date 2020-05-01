const Sequelize = require('sequelize');
const db         = require('../config/database');

const Flight = db.define('flight', {
    departureCity: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    destinationCity: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notDepartureCity(value){
                if (value == this.departureCity){
                    throw new Error('departure city and arrival city can\'t be the same!');
                }
            } 
        }
    },
    flightType: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['one-way', 'round-trip']], 
                msg: "flight type must be in  ['one-way', 'round-trip']"
            }
        }
    },
    departureDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
            isAfterNow(value){
                if (value.getTime() <= new Date().getTime()){
                    throw new Error('invalid departure date!. departure date can\'t be in the past.');
                }
            }
        }
    },
    arrivalDate: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
            isAfterDepartureDate(value){
                if (value.getTime() <= this.departureDate.getTime()){
                    throw new Error('invalid arrival date!. arrival time must occur after the departure date.');
                }
            }
        }
    },
	returnDate:{
		type: Sequelize.DATE,
        validate: {
            isAfterArrivalDateOrRequired(value){
                if (this.flightType === 'round-trip'){
					if (!value){
						throw new Error('return date is required for round-trips');
					}else if (value.getTime() <= this.arrivalDate.getTime()){
						throw new Error('invalid return date!. return date must occur after the arrival date');
					}
                }
            }
        }
	},
    totalNumberOfPersons: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    planeID: {
        type: Sequelize.INTEGER
    },
});


module.exports = Flight;