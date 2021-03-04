const Redis = require('ioredis');
const redis = new Redis();


this.testSet = function() {
	redis.set('foo', 'bar');

	redis.get('foo').then(function(result) {
		console.log(`If you are seeing this message, that means the redis database works. Result: ${result}`);
	});
}

this.newTimeTrialRecord = function(user, ot, lt, map, video) {
	redis.zadd(map, parseFloat(ot), `${user}-${lt}-${video}`);
}
