const Redis = require('ioredis');
const redis = new Redis();

const ReplyManager = require('./ReplyManager.js');

// Misc
this.testSet = function() {
	redis.set('foo', 'bar');

	redis.get('foo').then(function(result) {
		console.log(`If you are seeing this message, that means the redis database works. Result: ${result}`);
	});
}

this.getSeason = function(msgObj) {
	redis.get('season').then(function(result) {
		console.log(`Current season: ${result}`);

		ReplyManager.newReply(`Current Season`, `It is currently season ${result} of the Overload Racing League`, msgObj, `FFB400`);
	});
}

// Map List
this.newMap = function(map, author) {
	redis.rpush('maps', `${map} / Created by: ${author}`);
}

this.getMaps = function(msgObj) {
	redis.lrange('maps', 0, -1).then(function(err, result) {
		if(!err) {
			let maplist = `${result[0]}`;

			for(i = 1; i < result.length; i++) {
				maplist = `${maplist}\n${result[i]}`;
			}

			console.log(result);
			console.log(`List created:\n${maplist}`);

			ReplyManager.newReply('Current Map List', maplist, msgObj, 'FFB400');
		}
		else {
			console.log(`Error getting maps: ${err}`);
			ReplyManager.newReply('Error', `Sorry ${msgObj.member}, but there was a problem processing your request`, msgObj, 'D43E33');
		}
	});
}

// Time Trial Records
this.newTimeTrialRecord = function(user, time, map, video, msgObj) {
	redis.zadd(map, parseFloat(time), `${user} / Time: ${time} / Video: ${video}`);
}

this.getTimeTrialRecords = function(map, start, end, msgObj) {
	redis.zrange(map, start, end).then(function(err, result) {
		if(!err) {
			let list = `1) ${result[0]}`;

			for(i = 1; i < result.length; i++) {
				list = `${list}\n${i + 1}) ${result[i]}`;
			}

			console.log(result);
			console.log(`List created:\n${list}`);

			ReplyManager.newReply(`Leaderboard for ${map}`, list, msgObj, 'EDC344');
		}
		else {
			console.log(`Error getting leaderboard: ${err}`);
			ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there is no leaderboard for ${map}`, msgObj, 'D43E33');
		}
	});
}

// Race Records
this.addStats = function(handle, place, participants, map, msgObj) {
}

this.getPlayerStats = function(handle, msgObj) {
}

this.getTopStats = function(msgObj) {
}
