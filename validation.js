"use strict"

var measures = require('./measures')
var _ = require('underscore')

function crossValidation(recommender, samples, folds, options) {
	folds = folds || 10
	options = options || {}
}

function evaluateRecommender(recommender, training_set, test_set, options) {
	options = options || {}
	var mode = options.mode || 'test'
	
	var candidates = []
	
	switch(mode) {
		case 'training': candidates = training_set; break
		case 'test':     candidates = test_set; break
		case 'overlap':  candidates = _.intersection(test_set, training_set); break
		case 'union':    candidates = _.union(test_set, training_set); break
	}
	
	if(candidates.length < 1) {
		return new Error("no candidates")
	}

	var candidate_items = _.map(candidates, function(e) { return e[1]})

	_.each(training_set, function(sample) {
		recommender.feedback(sample[0], sample[1])
	})
	recommender.train()
	
	var test_users = _.uniq(_.map(test_set, function(e) {return e[0]}))
	
	var results = {
		'AUC':       0,
		'NDCG':      0,
		'MAP':       0,
		'MRR':       0,
		'prec@5':    0,
		'prec@10':   0,
		'recall@5':  0,
		'recall@10': 0
	}

	_.each(test_users, function(user) {
		var correct_items   = _.map(_.filter(test_set, function(e) {return e[0] == user}), function(e) { return e[1]})
		
		var recommended_items = recommender.recommend(user, candidate_items)
		console.log(user, candidate_items, recommended_items)
		var dropped = candidates.length - recommended_items
		
		results.AUC  += measures.AUC(recommended_items, correct_items, dropped)
		results.NDCG += measures.NDCG(recommended_items, correct_items)
		results.MAP  += measures.averagePrecision(recommended_items, correct_items)
		results.MRR  += measures.reciprocalRank(recommended_items, correct_items)
		results['prec@5']  += measures.precision(recommended_items, correct_items, 5)
		results['prec@10'] += measures.precision(recommended_items, correct_items, 10)
		results['recall@5']  += measures.recall(recommended_items, correct_items, 5)
		results['recall@10'] += measures.recall(recommended_items, correct_items, 10)
	})
	
	_.each(results, function(v, k) { results[k] /= test_users.length })
	results['num_users'] = test_users.length
	
	return results
}

module.exports.evaluateRecommender = evaluateRecommender
