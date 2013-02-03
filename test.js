"use strict"

var fs = require('fs')
var _ = require('underscore')
var Table = require('cli-table')

var Recommender  = require('./recommender')
var SplitDataset = require('./splitdataset.js')
var validation   = require('./validation')

var recommenders = {
	'zero': new Recommender('zero'),
	'random': new Recommender('random'),
	'most_popular': new Recommender('most_popular')
}

var measures = ['AUC', 'NDCG', 'MAP', 'MRR', 'prec@5', 'prec@10', 'recall@5', 'recall@10']

if(process.argv.length < 3) {
	console.log('Usage: node test <dataset>')
	process.exit()
}

var data = new SplitDataset(fs.createReadStream(process.argv[2]))
data.on('end', validate)

function validate() {
	var keys = _.keys(recommenders)
	var table = new Table({ head: [""].concat(keys) });
	
	var results = {}
	_.each(recommenders, function(recommender, name) {
		results[name] = validation.evaluateRecommender(recommender, data.train, data.test)
	})

	_.each(measures, function(measure) {
		var row = {}
		row[measure] = _.map(keys, function(key){ return results[key][measure].toFixed(4) })
		table.push(row)
	})

	console.log(table.toString());
}
