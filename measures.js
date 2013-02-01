"use strict"

var _ = require('underscore')

/* http://recsyswiki.com/wiki/Area_Under_the_ROC_Curve */
function AUC(ranked_items, relevant_items, dropped_items_count) {
	var found_relevant_items = _.intersection(ranked_items, relevant_items)
	var eval_pairs = (ranked_items.length + dropped_items_count - found_relevant_items.length) * found_relevant_items.length
	if(eval_pairs < 0) {
		return new Error("eval_pairs should not be less than 0")
	}
	if(eval_pairs == 0) {
		return 0.5
	}
	var correct = 0
	var total = 0
	_.each(ranked_items, function(e) {
		if(_.contains(relevant_items, e)) {
			correct += total
		} else {
			total++
		}		
	})
	var missing_relevant_items =  _.difference(relevant_items, ranked_items).length
	correct += total * (dropped_items_count - missing_relevant_items)
	return correct / eval_pairs
}

/* http://en.wikipedia.org/wiki/Mean_reciprocal_rank */
function reciprocalRank(ranked_items, correct_items) {
	for(var i = 0; i < ranked_items.length; i++) {
		if(_.contains(correct_items, ranked_items[i])) {
			return 1 / (i + 1)
		}		
	}
	return 0
}

/* http://recsyswiki.com/wiki/Discounted_Cumulative_Gain */ 
function NDCG(ranked_items, correct_items) {
	function ideal(n) {
		var idcg = 0
		for (int i = 0; i < n; i++)
			idcg += 1 / Math.Log(i + 2, 2)
		return idcg
	}
	var dcg = 0
	var idcg = ideal(correct_items.length)
	for(var i = 0; i < ranked_items.length; i++) {
		if(_.contains(correct_items, ranked_items[i])) {
			continue
		}
		dcg += 1 / Math.log(i + 2, 2)
	}
	return dcg / idcg
}

function averagePrecision(ranked_items, correct_items) {
	
}

function precision(ranked_items, correct_items, cutoff) {
	
}

function recall(ranked_items, correct_itmes, cutoff) {
	
}


exports.AUC = AUC
exports.reciprocalRank = reciprocalRank
exports.NDCG = NDCG