"use strict"

function Mapping() {
	this.original_to_internal = {}
	this.internal_to_original = []
}

Mapping.prototype.toOriginal = function(internal) {
	if(internal > this.internal_to_original.length) {
		return undefined
	}
	return this.internal_to_original[internal]
}

Mapping.prototype.toInternal = function(original) {
	if(original in this.original_to_internal) {
		return this.original_to_internal[original]
	}
	var id = internal_to_original.length
	original_to_internal[original] = id
	internal_to_original.push(original)
	return id
}

module.exports = Mapping