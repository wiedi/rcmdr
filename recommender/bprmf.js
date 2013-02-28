"use strict"

var _ = require('underscore')

var matrix = require('nothingreallymatrix')
var Mapping = require('../mapping')
var N = require('../util').N

function BPRMF(options) {
	options = options || {}
	this.factors          = options.factors || 10
	this.initial_mean     = options.initial_mean || 0
	this.initial_stddev   = options.initial_stddev || 0.1
	this.iterations       = options.iterations || 30
	this.with_replacement = options.with_replacement = false
	this.user_sampling    = options.user_sampling = false
	
	this.user_map = new Mapping()
	this.item_map = new Mapping()

	this.feedback_log = []
}

BPRMF.prototype.feedback = function(user, item) {
	var u = this.user_map.toInternal(user)
	var i = this.item_map.toInternal(item)
	
	this.feedback_log.push([u, i])
}

BPRMF.prototype.train = function() {
	var self = this
	
	/* init model */
	this.user_factors = new matrix.TypedMatrix(this.user_map.count(), this.factors)
	this.item_factors = new matrix.TypedMatrix(this.item_map.count(), this.factors)

	this.user_factors.setAll(function() { return N(self.initial_mean, self.initial_stddev)})
	this.item_factors.setAll(function() { return N(self.initial_mean, self.initial_stddev)})

	this.item_bias = new Float32Array(this.item_map.count())
	
	/* loss estimation ? */
	
	/* train */
	var iterate
	
	if(this.with_replacement) {
		if(this.user_sampling) {
			iterate = this.iterate_with_replacement_and_user_sampling
		} else {
			iterate = this.iterate_without_replacement_and_user_sampling
		}
	} else {
		if(this.user_sampling) {
			iterate = this.iterate_with_replacement_and_pair_sampling
		} else {
			iterate = this.iterate_without_replacement_and_pair_sampling
		}
	}
	
	for(var i = 0; i < this.iterations; i++) {
		iterate.call(this)
	}
	
}

BPRMF.prototype.iterate_with_replacement_and_user_sampling = function() {
	
}

BPRMF.prototype.iterate_without_replacement_and_user_sampling = function() {
	
}

BPRMF.prototype.iterate_with_replacement_and_pair_sampling = function() {
	
}

BPRMF.prototype.iterate_without_replacement_and_pair_sampling = function() {
	var self = this
		
	/* build random index */
	_.each(_.shuffle(self.feedback_log), function(feedback) {
		var user = feedback[0]
		var pos_item = feedback[1]
		var neg_item = self.sample_other_item(user, pos_item)
		self.update_factors(user, pos_item, neg_item)
	})
}

BPRMF.prototype.predict = function(user, item) {
	user = this.user_map.toInternal(user)
	item = this.item_map.toInternal(item)
	if(user > this.user_factors.rows || item > this.item_factors.rows) {
		return -1;
	}
	return this.item_bias[item] + this.user_factors.rowScalarProduct(user, this.item_factors, item)
}

BPRMF.prototype.sample_other_item = function(user, item) {
	
}

BPRMF.prototype.update_factors = function(user, item, other_item, update_u, update_i, update_j) {
	
}

module.exports = BPRMF
