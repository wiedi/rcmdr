"use strict"

var _ = require('underscore')

var matrix = require('nothingreallymatrix')
var Mapping = require('../mapping')
var N = require('../util').N

function BPRMF(options) {
	options = options || {}
	this.factors          = options.factors || 20
	this.initial_mean     = options.initial_mean || 0
	this.initial_stddev   = options.initial_stddev || 0.1
	this.iterations       = options.iterations || 30
	this.with_replacement = options.with_replacement || false
	this.user_sampling    = options.user_sampling|| false
	this.update_j         = options.update_j || true
	
	/* 
	   BiasReg and BiasLearnRate can be initially set to 1, but you can lower 
	   them to see whether you get better results (this is usually the case - 
	   I guess you almost always get better results e.g. with 0.5). 
	   -- http://groups.google.com/group/mymedialite/tree/browse_frm/month/2012-02/61525e952d0f1897?rnum=31&_done=/group/mymedialite/browse_frm/month/2012-02?&pli=1
	*/
	this.bias_reg   = options.bias_reg || 0.5
	this.learn_rate = options.learn_rate || 0.5
	this.reg_u      = options.reg_u || 0.0025
	this.reg_i      = options.reg_i || 0.0025
	this.reg_j      = options.reg_j || 0.0025

	
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

	/* create feedback matrices */
	this.user_matrix = new matrix.SparseBooleanMatrix()
	for(var n = 0; n < this.feedback_log.length; n++) {
		var u = this.feedback_log[n][0]
		var i = this.feedback_log[n][1]
		this.user_matrix.set(u, i, true)
	}
		
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
		self.update_factors(user, pos_item, neg_item, true, true, self.update_j)
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
	var item_is_positive = this.user_matrix.get(user, item)
	do {
		var other_item = Math.floor(Math.random() * this.item_map.count())
	}  while(this.user_matrix.get(user, other_item) == item_is_positive)
	return other_item
}

BPRMF.prototype.update_factors = function(user, item, other_item, update_u, update_i, update_j) {
	var x_uij = this.item_bias[item] - this.item_bias[other_item] + this.user_factors.rowScalarProductWithRowDifference(user, this.item_factors, item, this.item_factors, other_item)
	var one_over_one_plus_ex = 1 / (1 + Math.exp(x_uij))
	
	if(update_i) {
		var update = one_over_one_plus_ex - this.bias_reg * this.item_bias[item]
		this.item_bias[item] += this.learn_rate * update
	}
	if(update_j) {
		var update = -one_over_one_plus_ex - this.bias_reg * this.item_bias[other_item]
		this.item_bias[other_item] += this.learn_rate * update
	}
	
	for(var f = 0; f < this.factors; f++) {
		var w_uf = this.user_factors.get(user, f)
		var h_if = this.item_factors.get(item, f)
		var h_jf = this.item_factors.get(other_item, f)
		
		if(update_u) {
			var update = (h_if - h_jf) * one_over_one_plus_ex - this.reg_u * w_uf
			this.user_factors.set(user, f, w_uf + this.learn_rate * update)
		}
		
		if(update_i) {
			var update = w_uf * one_over_one_plus_ex - this.reg_i * h_if
			this.item_factors.set(item, f, h_if + this.learn_rate * update)
		}
		
		if(update_j) {
			var update = -w_uf * one_over_one_plus_ex - this.reg_i * h_jf
			this.item_factors.set(other_item, f, h_jf + this.learn_rate * update)
		}
	}
}

module.exports = BPRMF
