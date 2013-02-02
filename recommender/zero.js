"use strict"

function Zero() {
	
}

Zero.prototype.feedback = function(user, item) {}
Zero.prototype.train = function() {}
Zero.prototype.predict = function(user, item) {
	return 0
}

module.exports = Zero
