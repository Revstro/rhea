const Redis = require('ioredis');
const redis = new Redis();

const ReplyManager = require('./ReplyManager.js');

this.testSet = function() {
	redis.set('foo', 'bar');

	redis.get('foo').then(function(result) {
		console.log(`If you are seeing this message, that means the redis database works. Result: ${result}`);
	});
}

this.newMap = function(map, author) {
	redis.rpush('maps', `${map} / Created by: ${author}`);
}

this.getMaps = function(msgObj) {
	redis.lrange('maps', 0, -1).then(function(result) {
		let maplist = `${result[0]}`;

		for(i = 1; i < result.length; i++) {
			maplist = `${maplist}\n${result[i]}`;
		}

		console.log(result);
		console.log(`List created:\n${maplist}`);

		ReplyManager.newReply('Current Map List', maplist, msgObj, 'FFB400');
	});
}

this.newTimeTrialRecord = function(user, time, map, video, msgObj) {
	redis.zadd(map, parseFloat(time), `${user} / Time: ${time} / Video: ${video}`);
}

this.getTimeTrialRecords = function(map, start, end, msgObj) {
	redis.zrange(map, start, end).then(function(result) {
		let list = `1) ${result[0]}`;

		for(i = 1; i < result.length; i++) {
			list = `${list}\n${i + 1}) ${result[i]}`;
		}

		console.log(result);
		console.log(`List created:\n${list}`);

		ReplyManager.newReply(`Leaderboard for ${map}`, list, msgObj, 'EDC344');
	});
}
