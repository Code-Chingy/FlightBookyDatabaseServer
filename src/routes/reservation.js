const express       = require("express");
const Reservation   = require('../models/reservation');
const Flight        = require('../models/flight');
const MiddleWares   = require('../config/middlewares');
const Functions     = require('../utils/functions');
const router        = express.Router();


router.post("/", MiddleWares.userAuthRequired, (req, res)=>{

    let data = req.body;

    if (Functions.hasOwnProperties(data, ['travelClass', 'numberOfPersons', 'flightID'])){
     
        Reservation.count({where: {
            userID: req.user.id,
            flightID: data.flightID,
            reservationStatus: 'not-complete'
        }}).then((count)=>{
            if (count == 0){        
                Reservation.create({
                    userID: req.user.id,
                    flightID: data.flightID,
                    travelClass: data.travelClass,
                    numberOfPersons: data.numberOfPersons
                }).then((reservation)=>{
                    console.log("new reservation added : ", reservation);
                    res.status(200).json({status: 'success', result: { data: reservation}});
                }).catch((err)=>{
                    res.status(500).json({status: 'failed', result: {message: 'error creating new reservation', error: err}});
                });
            }
            else{
                res.status(500).json({status: 'failed', result: {message: 'you already made this reservation!. you can try updating it'}});
            }
        }).catch((err)=>{
            res.status(500).json({status: 'failed', result: {message: 'unable to make reservation', error: err}});
        });

    }
    else{
        res.status(500).json({status: 'failed', result: {message: 'arguments not valid. requires travelClass, numberOfPersons and flightID'}});
    }

});

router.get("/", MiddleWares.userAuthRequired, (req, res)=>{
    let whereClause = {
		userID:req.user.id
	}
    Reservation.findAll({where: whereClause}).then((reservations) => {
        res.status(200).json({status: 'success', result: { data: reservations }});       
    }).catch((err) => {
        res.status(500).json({status: 'failed', result: {message: 'unable to get reservations', error: err}});
    });
});

router.delete("/", MiddleWares.userAuthRequired, (req, res)=>{
    let whereClause = req.body;
    if (!whereClause) whereClause = {};
    whereClause.userID = req.user.id;
    Reservation.destroy({
        where: whereClause, truncate: true
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted reservation successfully'}});
    }).catch((err) => { 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete reservation', error: err}});
    });
});

router.get("/:id", MiddleWares.userAuthRequired, (req, res)=>{
    Reservation.findOne({
        where: {
            userID: req.user.id,
            id: req.params.id
        }
    }).then((reservation) => {
        res.status(200).json({status: 'success', result: { data: reservation }});
    }).catch((err)=>{
        res.status(500).json({status: 'failed', result: {message: 'unable to get reservation', error: err}});
    });
});

router.delete("/:id", MiddleWares.userAuthRequired, (req, res)=>{
    
    Reservation.destroy({
        where: {
            userID: req.user.id,
            id: req.params.id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted reservation successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete reservation', error: err}});
    });
});

router.put("/:id", MiddleWares.userAuthRequired, (req, res)=>{
    Reservation.update(req.body, {
        where: {
            userID: req.user.id,
            id: req.params.id
        }
    }).then((reservation) => {
        res.status(200).json({status: 'success', result: {data: reservation, message: 'updated reservation successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to update reservation', error: err}});
    });
});


router.post("/query", MiddleWares.userAuthRequired, (req, res)=>{
	console.log("queryOptions: ", req.body);
	let options = req.body
	if (!options.hasOwnProperty('where')) options.where = { }; 
	if (!options.hasOwnProperty('limit')) options.limit = 20; 
	if (!options.hasOwnProperty('order')) options.order = [['createdAt', 'DESC']];
	
	options.where.userID = req.user.id;
	
	if (options.where.hasOwnProperty('anyField') || options.where.hasOwnProperty('allField')){
		let anyField = options.where.anyField;
		let allField = options.where.allField;
		let query = anyField ? anyField : allField;
		delete options.where.anyField;
		delete options.where.allField;
		options.where[anyField ? '$or': '$and'] = [
			{
				flightID: query
			},
			{   
				reservationStatus: query
			},
			{   
				travelClass: query
			},
			{   
				numberOfPersons: query
			},
			{   
				paymentAmount: query
			},
			{   
				paymentDate: query
			}
		]
		
	}
	
	console.log(options);
	
    Flight.findAll(options).then((flights) => {
        res.status(200).json({status: 'success', result: { data: flights}});
    }).catch((err)=>{
        res.status(500).json({status: 'failed', result: {message: 'unable to get flights', error: err}});
    });
});

module.exports = router;