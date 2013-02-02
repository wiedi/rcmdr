"use strict"

function Random() {
	
}

Random.prototype.feedback = function(user, item) {}
Random.prototype.train = function() {}
Random.prototype.predict = function(user, item) {
	return Math.random()
}

module.exports = Random
