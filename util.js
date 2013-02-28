N = function(mean, stddev) {
	mean   = mean   || 0.0;
	stddev = stddev || 1.0;
		
	var s, v1, v2;
	do {
		v1 = Math.random() * 2 - 1;
		v2 = Math.random() * 2 - 1;
		s = v1 * v1 + v2 * v2;
	} while(0 >= s || s > 1)
		
	return Math.sqrt(-2 * Math.log(s) / s) * v1 * Math.sqrt(stddev) + mean;
}

exports.N = N
