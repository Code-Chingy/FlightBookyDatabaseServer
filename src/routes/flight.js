const express       = require("express");
const Flight        = require('../models/flight');
const MiddleWares   = require('../config/middlewares');
const Functions     = require('../utils/functions');
const router        = express.Router();


router.post("/", MiddleWares.adminAuthRequired, (req, res)=>{

    let data = req.body;

    if (Functions.hasOwnProperties(data, ['departureCity', 'destinationCity', 'flightType', 'departureDate', 'arrivalDate', 'totalNumberOfPersons', 'price'])){
     
        Flight.create({
            departureCity: data.departureCity.trim().toLowerCase(), //validate not equal to destination
            destinationCity: data.destinationCity.trim().toLowerCase(), //validate not equal to departure
            flightType: data.flightType, //one-way, round-trip
            departureDate: data.departureDate, //validate not less than date.now
            arrivalDate: data.arrivalDate, //validate not departureDate
			returnDate: data.returnDate,
            totalNumberOfPersons: data.totalNumberOfPersons, //validate > 1
            price: data.price
        }).then((flight) => {
            console.log("new user added : ", flight);
            res.status(200).json({status: 'success', result: { data: flight}});
        }).catch((err) => {
            console.log("error adding new user : ", err);
            res.status(500).json({status: 'failed', result: {message: 'error adding new flight', error: err}});
        });
        
   }
   else{
        res.status(500).json({status: 'failed', result: {message: 'arguments not valid. requires departureCity, destinationCity, flightType, departureDate, arrivalDate and totalNumberOfPersons'}});
   }

});

router.get("/", (req, res)=>{
    Flight.findAll({ where: { } }).then((flights) => {
        res.status(200).json({status: 'success', result: { data: flights}});
    }).catch((err)=>{
        res.status(500).json({status: 'failed', result: {message: 'unable to get flights', error: err}});
    });
});


router.delete("/", MiddleWares.adminAuthRequired, (req, res)=>{
    let whereClause = req.body;
    if (!whereClause) whereClause = {};
    Flight.destroy({ where:  whereClause, truncate: true }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted flight successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete flight', error: err}});
    });
});

router.get("/:id", (req, res)=>{
    Flight.findOne({
        where: {
            id: req.params.id
        }
    }).then((flight) => {
        res.status(200).json({status: 'success', result: { data: flight}});     
    }).catch((err)=>{
        res.status(500).json({status: 'failed', result: {message: 'unable to get flight', error: err}});
    });
});

router.delete("/:id", MiddleWares.adminAuthRequired, (req, res)=>{
    Flight.destroy({
        where: {
          id: req.params.id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'deleted flight successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to delete flight', error: err}});
    });
});

router.put("/:id", MiddleWares.adminAuthRequired, (req, res)=>{
    Flight.update(req.body, {
        where: {
          id: req.params.id
        }
    }).then(() => {
        res.status(200).json({status: 'success', result: {message: 'updated flight successfully'}});
    }).catch((err)=>{ 
        res.status(500).json({status: 'failed', result: {message: 'unable to update flight', error: err}});
    });
});


router.post("/query", (req, res)=>{
	console.log("queryOptions: ", req.body);
	let options = req.body
	if (!options.hasOwnProperty('where')) options.where = { }; 
	if (!options.hasOwnProperty('limit')) options.limit = 20; 
	if (!options.hasOwnProperty('order')) options.order = [['departureDate', 'DESC']];
	
	if (options.where.hasOwnProperty('anyField') || options.where.hasOwnProperty('allField')){
		let anyField = options.where.anyField;
		let allField = options.where.allField;
		let query = anyField ? anyField : allField;
		delete options.where.anyField;
		delete options.where.allField;
		options.where[anyField ? '$or': '$and'] = [
			{
				id: query
			},
			{
				departureCity: query
			},
			{   
				destinationCity: query
			},
			{   
				flightType: query
			},
			{   
				price: query
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