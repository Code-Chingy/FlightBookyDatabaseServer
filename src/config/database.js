const Sequelize = require('sequelize');
const Op = Sequelize.Op;
module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: require('../utils/constants').DB_PATH,
	operatorsAliases: {
		$like: Op.like,
		$and: Op.and,
		$or: Op.or,
		$not: Op.not,
		$eq: Op.eq,	
		$gt: Op.gt,
		$lt: Op.lt,
		$lte: Op.lte,
		$gte: Op.gte,
		$is: Op.is,
		$between: Op.between,		
		$notLike: Op.notLike,		
		$notBetween: Op.notBetween,
		$regexp: Op.regexp,
		$in: Op.in,
		$notIn: Op.notIn,
		$col: Op.col,
		$ne: Op.ne,
		$any: Op.any,
		$all: Op.all,
	}
});