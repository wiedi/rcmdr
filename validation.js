"use strict"

var measures = require('./measures')
var _ = require('underscore')

function crossValidation(recommender, samples, folds, options) {
	folds = folds || 10
	options = options || {}
}

function evaluateRecommender(recommender, training_data, test_data, options) {
	options = options || {}

	_.each(training_data.feedback, function(sample) {
		recommender.feedback(sample[0], sample[1])
	})
	console.log('starting training...')
	recommender.train()
	console.log('training done...')
	
	var test_users = _.keys(test_data.users)
	var candidate_items = _.keys(test_data.items)
		
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
		var correct_items   = test_data.users[user]
		
		var recommended_items = recommender.recommend(user, candidate_items)
		var dropped = candidate_items.length - recommended_items.length
		
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
