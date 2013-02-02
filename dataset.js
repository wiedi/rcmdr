"use strict"

var util = require('util')
var EventEmitter = require('events').EventEmitter
var Lazy = require('lazy')

function Dataset(stream) {
	this.users = {}
	this.items = {}
	this.feedbacks = []
	
	EventEmitter.call(this)
	
	if(stream) {
		stream.on('end', function() {
			this.emit('end')
		})
		Lazy(stream).lines.map(String).map(function(line) {
			var l = line.split(',')
			this.add(l[0], l[1])
		})
	}	
}

util.inherits(Dataset, EventEmitter)

Dataset.prototype.add = function(user, item) {
	if(!(user in this.users)) {
		this.users[user] = []
	}
	if(!(item in this.items)) {
		this.items[item] = []
	}
	this.users[user].push(item)
	this.items[item].push(user)
	this.feedbacks.push([user, item])
	this.emit("impression", [user, item])
}

module.exports = Dataset
