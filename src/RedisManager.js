const Discord = require('discord.js');
const Redis = require('ioredis');
const redis = new Redis();

const ReplyManager = require('./ReplyManager.js');
const RankManager = require('./RankManager.js');

// Misc
this.testSet = function() {
	redis.set('foo', 10);

	redis.get('foo').then(function(result) {
		console.log(`If you are seeing this message, that means the redis database works. Result: ${result}\nSome Arithmetics: ${parseInt(result) + 1}`);
	});
}

this.getSeason = function(msgObj) {
	redis.get('season').then(function(result) {
		console.log(`Current season: ${result}`);

		ReplyManager.newReply(`Current Season`, `It is currently season ${result} of the Overload Racing League`, msgObj, `00E3FF`);
	});
}

// Map List
this.newMap = function(map, author) {
	redis.rpush('maps', `${map} / Created by: ${author}`);
}

this.getMaps = function(msgObj) {
	redis.lrange('maps', 0, -1).then(function(result) {
		if(result.length > 0) {
			let maplist = `${result[0]}`;

			for(i = 1; i < result.length; i++) {
				maplist = `${maplist}\n${result[i]}`;
			}

			console.log(result);
			console.log(`List created:\n${maplist}`);

			ReplyManager.newReply('Current Map List', maplist, msgObj, 'FFB400');
		}
		else {
			console.log(`ERROR: Unable to obtain map list`);
			ReplyManager.newReply('Error', `Sorry ${msgObj.member}, but there was a problem processing your request`, msgObj, 'D43E33');
		}
	});
}

// Time Trial Records
this.newTimeTrialRecord = function(user, time, map, video, msgObj) {
	redis.zadd(map, parseFloat(time), `${user} / Time: ${time} / Video: ${video}`);
}

this.getTimeTrialRecords = function(map, start, end, msgObj) {
	redis.zrange(map, start, end).then(function(result) {
		if(result.length > 0) {
			let list = `1) ${result[0]}`;

			for(i = 1; i < result.length; i++) {
				list = `${list}\n${i + 1}) ${result[i]}`;
			}

			console.log(result);
			console.log(`List created:\n${list}`);

			ReplyManager.newReply(`Leaderboard for ${map}`, list, msgObj, 'EDC344');
		}
		else {
			console.log(`ERROR: Leaderboard for ${map} does not exist`);
			ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there is no leaderboard for ${map}`, msgObj, 'D43E33');
		}
	});
}

// Race Records
/** Adds new stats to a player
 * @param {Discord.GuildMember} handle The discord member
 * @param {number} place The final placing
 * @param {number} participants The number of participants in the race
 * @param {string} map The name of the map
 * @param {Discord.Message} Discord message object
 * @returns {number} Error status of the function. 1 = Error, 0 = No Error
*/
this.addStats = function(handle, place, participants, map, msgObj) {
	let ptsTotal;
	let ptsMax;
	let racesWon;
	let season;

	console.log(`ID of the player: ${handle.id}`);

	// Before we do anything else, we need to check the value of place
	if(place < 0) {
		console.log(`ERROR: invalid place: ${place}`);
		ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Invalid place\``, msgObj, 'D43E33');
		return 1;
	}

	// First, get the season
	redis.get('season').then(function(result0) {
		if(result0 != null) {
			season = parseInt(result0);

		        // Get the total points of the player
			redis.get(`${handle.id}-${season}:total-points`).then(function(result1) {
				if(result1 != null) {
					ptsTotal = parseInt(result1);
				}
				else {
					console.log(`${handle.displayName} does not have any points for season ${season}... creating a new entry...`);
					redis.set(`${handle.id}-${season}:total-points`, 0);
					ptsTotal = 0;
				}

				// Get the maximum points the player could've gotten
				redis.get(`${handle.id}-${season}:max-points`).then(function(result2) {
					if(result2 != null) {
						ptsMax = parseInt(result2);
					}
					else {
						console.log(`${handle.displayName} does not have any max points for season ${season}... creating a new entry...`);
						redis.set(`${handle.id}-${season}:max-points`, 0);
						ptsMax = 0;
					}

					// Get the number of races the player has won
					redis.get(`${handle.id}-${season}:races-won`).then(function(result3) {
						if(result3 != null) {
							racesWon = parseInt(result3);
						}
						else {
							console.log(`${handle.displayName} does not have any races won for season ${season}.. creating a new entry...`);
							redis.set(`${handle.id}-${season}:races-won`, 0);
							racesWon = 0;
						}

						console.log(`Passing to RankManager: ${place}, ${participants}, ${ptsTotal}, ${ptsMax}`);
						let newRank = RankManager.calculateRank(place, participants, ptsTotal, ptsMax);

						// Update the values in redis
						redis.set(`${handle.id}-${season}:total-points`, (((participants - place) + 1) + ptsTotal));
						redis.set(`${handle.id}-${season}:max-points`, (ptsMax + participants));

						// Check if the player finished in first place
						if(place === 1) {
							redis.set(`${handle.id}-${season}:races-won`, (racesWon + 1));
						}

						// Update the player's rank
						RankManager.updateRank(handle, newRank);

						// Get the date
						let cDate = Date.now();

						// Add a new entry to the player's race history
						switch(place) {
							case 0:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / DNF / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 1:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 1st / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 2:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 2nd / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 3:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 3rd / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							default:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / ${place}th / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
						}
					});
				});
			});
		}
		else {
			console.log(`ERROR: Unable to obtain season`);
			ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Unable to obtain season\``, msgObj, 'D43E33');
			return 1;
		}
	});

	return 0;
}

this.getPlayerStats = function(handle, msgObj) {
}

this.getTopStats = function(msgObj) {
}
