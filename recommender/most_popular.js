"use strict"

function MostPopular() {
	this.counts = {}
	this.total = 0
}

MostPopular.prototype.feedback = function(user, item) {
	if(!(item in this.counts)) {
		this.counts[item] = 0
	}
	this.counts[item]++
	this.total++
}

MostPopular.prototype.train = function() {}

MostPopular.prototype.predict = function(user, item) {
	if(!(item in this.counts)) return 0
	return this.counts[item] / this.total
}

module.exports = MostPopular
