"use strict"

var util = require('util')
var EventEmitter = require('events').EventEmitter
var Lazy = require('lazy')
var Dataset = require('./dataset')

function SplitDataset(stream, ratio) {	
	EventEmitter.call(this)
	
	this.ratio = ratio || 0.5
	
	this.train = new Dataset()
	this.test  = new Dataset()
	
	var self = this
	
	if(stream) {
		stream.on('end', function() {
			self.emit('end')
		})
		Lazy(stream).lines.map(String).map(function(line) {
			var l = line.split(',')
			self.add(l[0], l[1])
		})
	}
}

util.inherits(SplitDataset, EventEmitter)

SplitDataset.prototype.add = function(user, item) {
	if(Math.random() < this.ratio) {
		this.test.add(user, item)
	} else {
		this.train.add(user, item)
	}
}

module.exports = SplitDataset
