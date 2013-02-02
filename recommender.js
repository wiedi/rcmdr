"use strict"

var Mapping = require('./mapping')
var _ = require('underscore')

var algorithms = {
	'zero':         require('./recommender/zero'),
	'random':       require('./recommender/random'),
	'most_popular': require('./recommender/most_popular')
}

function Recommender(algorithm, options) {
	this.recommender = new algorithms[algorithm](options)
}


function sortByValue(object) {
	function compare(a, b) { return b[1] - a[1] }
	return _.map(_.pairs(object).sort(compare), function(i) { return i[0] })
}

Recommender.prototype.recommend = function(user, candidate_items) {
	var scores = {}
	for(var i = 0; i < candidate_items.length; i++) {
		scores[candidate_items[i]] = this.recommender.predict(user, candidate_items[i])
	}
	return sortByValue(scores)
}


Recommender.prototype.feedback = function(user, item) {
	this.recommender.feedback(user, item)
}

Recommender.prototype.train = function() {
	this.recommender.train()
}

module.exports = Recommender