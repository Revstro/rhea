const Discord = require('discord.js');
const Redis = require('ioredis');
const redis = new Redis();

const ReplyManager = require('./ReplyManager.js');
const RankManager = require('./RankManager.js');
const Settings = require('../private/settings.json');

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

this.save = function(msgObj) {
	redis.save().then(function(result) {
		console.log(`Saving database... Result: ${result}`);
		ReplyManager.newReply(`Database`, `Response: ${result}`, msgObj, `00E3FF`);
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
						redis.set(`${handle.id}-${season}:max-points`, (ptsMax + parseInt(participants)));

						// Check if the player finished in first place
						if(parseInt(place) === 1) {
							redis.set(`${handle.id}-${season}:races-won`, (racesWon + 1));
						}

						// Update the player's rank
						RankManager.updateRank(handle, newRank);

						// Update the player's standing in the season
						redis.zrem(`standings-${season}`, `${handle.id}`);
						redis.zadd(`standings-${season}`, newRank, `${handle.id}`);

						// Get the date
						let cDate = new Date();

						// Add a new entry to the player's race history
						switch(parseInt(place)) {
							case 0:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / DNF / ${parseInt(cDate.getMonth()) + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 1:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 1st / ${parseInt(cDate.getMonth()) + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 2:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 2nd / ${parseInt(cDate.getMonth()) + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							case 3:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / 3rd / ${parseInt(cDate.getMonth()) + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
							default:
								redis.lpush(`${handle.id}-${season}:race-history`, `${map} / ${place}th / ${cDate.getMonth() + 1}.${cDate.getDate()}.${cDate.getFullYear()}`);
								break;
						}

						console.log(`Finished updating stats for ${handle.displayName}`);
						ReplyManager.newReply(`Stats`, `Updated ${handle}'s stats`, msgObj, `1D00FC`);
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

/** Gets the stats of the player
 * @param {Discord.GuildMember} handle The discord member
 * @param {number} season The season requested (use "UseCurrent" to get the current season)
 * @param {Discord.Message} msgObj Discord message object
 * @returns {number} Error status of the function. 1 = Error, 0 = No Error
*/
this.getPlayerStats = function(handle, season, msgObj) {
	//let ptsTotal;
	//let ptsMax;
	//let racesWon;
	//let season;
	//let seasonRank;

	if(season === `UseCurrent`) {
		redis.get(`season`).then(function(result0) {
			if(result0 !== null) {
				//season = result0;

				redis.get(`${handle.id}-${result0}:total-points`).then(function(result1) {
					if(result1 !== null) {
						//ptsTotal = parseInt(result1);

						redis.get(`${handle.id}-${result0}:max-points`).then(function(result2) {
							//ptsMax = parseInt(result2);

							redis.get(`${handle.id}-${result0}:races-won`).then(function(result3) {
								//racesWon = parseInt(result3);

								redis.zrevrank(`standings-${result0}`, `${handle.id}`).then(function(result4) {
									//seasonRank = parseInt(result4) + 1;

									redis.lrange(`${handle.id}-${result0}:race-history`, 0, 4).then(function(result5) {
										let raceHistory = result5[0]
										for(i = 1; i < result5.length; i++) {
											raceHistory = `${raceHistory}\n${result5[i]}`
										}

										console.log(`Stats obtained for ${handle.displayName}:`);
										console.log(`Rank in current season: ${parseInt(result4) + 1}`);
										console.log(`Rank %: ${result1}/${result2}`);
										console.log(`Races won: ${result3}`);
										console.log(`Recent games:\n${raceHistory}`);

										ReplyManager.newReply(`Stats for ${handle.displayName}`, `Standing in current season: **#${parseInt(result4) + 1}**\n\nRank %: **${result1}/${result2} (${(parseInt(result1)/parseInt(result2))*100})**\nRaces won: **${result3}**\n\nRecent games:\n${raceHistory}`, msgObj, `1D00FC`);
									});
								});
							});
						});
					}
					else {
						console.log(`ERROR: ${handle.displayName} does not have any stats for season ${season}`);
						ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but ${handle} does not have any stats in the current season`, msgObj, `D43E33`);
						return 1;
					}
				});
			}
			else {
				console.log(`ERROR: Unable to obtain season`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Unable to obtain season\``, msgObj, 'D43E33');
				return 1;
			}
		});
	}
	else {
		redis.get(`${handle.id}-${season}:total-points`).then(function(result1) {
			if(result1 !== null) {
				//ptsTotal = parseInt(result1);

				redis.get(`${handle.id}-${season}:max-points`).then(function(result2) {
					//ptsMax = parseInt(result2);

					redis.get(`${handle.id}-${season}:races-won`).then(function(result3) {
						//racesWon = parseInt(result3);

						redis.zrevrank(`standings-${season}`, `${handle.id}`).then(function(result4) {
							//seasonRank = parseInt(result4) + 1;

							redis.lrange(`${handle.id}-${season}:race-history`, 0, 4).then(function(result5) {
								let raceHistory = result5[0]
								for(i = 1; i < result5.length; i++) {
									raceHistory = `${raceHistory}\n${result5[i]}`
								}
								console.log(`Stats obtained for ${handle.displayName}:`);
								console.log(`Rank in season ${season}: ${parseInt(result4) + 1}`);
								console.log(`Rank %: ${result1}/${result2}`);
								console.log(`Races won: ${result3}`);
								console.log(`Recent games:\n${raceHistory}`);

								ReplyManager.newReply(`Stats for ${handle.displayName}`, `Standing in season ${season}: **#${parseInt(result4) + 1}**\n\nRank %: **${result1}/${result2} (${(parseInt(result1)/parseInt(result2))*100})**\nRaces won: **${result3}**\n\nRecent games:\n${raceHistory}`, msgObj, `1D00FC`);
							});
						});
					});
				});
			}
			else {
				console.log(`ERROR: ${handle.displayName} does not have any stats for season ${season}`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but ${handle} does not have any stats for season **${season}**`, msgObj, `D43E33`);
				return 1;
			}
		});

	}
	return 0;
}

/** Gets the race history of the player
 * @param {Discord.GuildMember} handle The discord member
 * @param {number} season The season requested (use "UseCurrent" to get the current season)
 * @param {number} start The start of the list
 * @param {number} end The end of the list
 * @param {Discord.Message} msgObj Discord message object
 * @returns {number} Error status of the function. 1 = Error, 0 = No Error
*/
this.getRaceHistory = function(handle, season, start, end, msgObj) {
	if(season === `UseCurrent`) {
		redis.get(`season`).then(function(result0) {
			if(result0 !== null) {
				redis.lrange(`${handle.id}-${result0}:race-history`, start, end).then(function(result1) {
					if(result1.length > 0) {
						let historylist = `**Ordered from most to least recent**\n${result1[0]}`;

						for(i = 1; i < result1.length; i++) {
							historylist = `${historylist}\n${result1[i]}`;
						}

						console.log(result1);
						console.log(`List created:\n${historylist}`);

						ReplyManager.newReply(`Race History of ${handle.displayName}`, historylist, msgObj, '1D00FC');
					}
					else {
						console.log(`ERROR: Unable to obtain player stats`);
						ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but I wasn't able to find anything`, msgObj, `D43E33`);
					}
				});
			}
			else {
				console.log(`ERROR: Unable to obtain season`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Unable to obtain season\``, msgObj, 'D43E33');
				return 1;
			}
		});
	}
	else {
		redis.lrange(`${handle.id}-${season}:race-history`, start, end).then(function(result) {
			if(result.length > 0) {
				let historylist = `**Ordered from most to least recent**\n\n${result[0]}`;

				for(i = 1; i < result.length; i++) {
					historylist = `${historylist}\n${result[i]}`;
				}

				console.log(result);
				console.log(`List created:\n${historylist}`);

				ReplyManager.newReply(`Race History of ${handle.displayName}`, historylist, msgObj, '1D00FC');
			}
			else {
				console.log(`ERROR: Unable to obtain player stats`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but I wasn't able to find anything`, msgObj, `D43E33`);
				return 1;
			}
		});
	}

	return 0;
}
/** Gets the standings of the season
 * @param {*} season The specified season
 * @param {number} start The start of the list
 * @param {number} end The end of the list
 * @param {Discord.Message} msgObj Discord message object
 * @returns {number} Error status of the function. 1 = Error, 0 = No Error
*/
this.getStandings = function(season, start, end, msgObj) {
	if(season === "UseCurrent") {
		redis.get('season').then(function(result0) {
			if(result0 !== null) {
				redis.zrevrange(`standings-${result0}`, start, end).then(function(result) {
					if(result.length > 0) {
						let standlist = `1) <@!${result[0]}>`;
						for(i = 1; i < result.length; i++) {
							standlist = `${standlist}\n${i + 1}) <@!${result[i]}>`;
						}

						console.log(`List created:\n${standlist}`);
						ReplyManager.newReply(`Standings`, `Top ${parseInt(end) + 1} of season ${season}\n${standlist}`, msgObj, `1D00FC`);
					}
					else {
						console.log(`ERROR: No standings for season ${season}`);
						ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but I could not find any standings in the current season`, msgObj, 'D43E33');
						return 1;
					}
				});
			}
			else {
				console.log(`ERROR: Unable to obtain season`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Unable to obtain season\``, msgObj, 'D43E33');
				return 1;
			}
		});
	}
	else {
		redis.zrange(`standings-${season}`, start, end).then(function(result) {
			if(result.length > 0) {
				let standlist = `1) <@!${result[0]}>`;
				for(i = 1; i < result.length; i++) {
					standlist = `${standlist}\n${i + 1}) <@!${result[i]}>`;
				}

				console.log(`List created:\n${standlist}`);
				ReplyManager.newReply(`Standings`, `Top ${parseInt(end) + 1} of season ${season}\n${standlist}`, msgObj, `1D00FC`);
			}
			else {
				console.log(`ERROR: No standings for season ${season}`);
				ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but I could not find any standings for that season`, msgObj, 'D43E33');
				return 1;
			}
		});
	}

	return 0;
}

/** Adds new stats to a player
 * @param {Discord.GuildMember} handle The discord member
 * @param {number} place The final placing
 * @param {number} participants The number of participants in the race
 * @param {Discord.Message} msgObj Discord message object
 * @returns {number} Error status of the function. 1 = Error, 0 = No Error
*/
this.getSimulation = function(handle, place, participants, msgObj) {
	let ptsTotal;
	let ptsMax;
	let season;

	console.log(`ID of the player: ${handle.id}`);

	// Before we do anything else, we need to check the value of place and value of participants
	if(parseInt(place) < 0 || parseInt(participants) < 8 || parseInt(place) > parseInt(participants)) {
		console.log(`ERROR: Invalid simulation: ${place}`);
		ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Invalid simulation (requirements: place <= participants, place > 0, participants > 7)\``, msgObj, 'D43E33');
		return 1;
	}

	// First, get the season
	redis.get(`season`).then(function(result0) {
		if(result0 !== null) {
			season = parseInt(result0);

			// Get the total points of the player
			redis.get(`${handle.id}-${season}:total-points`).then(function(result1) {
				if(result1 !== null) {
					ptsTotal = parseInt(result1);

					// Get the maximum points the player could've gotten
					redis.get(`${handle.id}-${season}:max-points`).then(function(result2) {
						ptsMax = parseInt(result2);

						let newPtsTotal;
						if(parseInt(place) === 0) {
							newPtsTotal = ptsTotal;
						}
						else {
							newPtsTotal = ptsTotal + ((parseInt(participants) - parseInt(place)) + 1);
						}
						let newPtsMax = ptsMax + parseInt(participants);

						console.log(`Passing to RankManager: ${place}, ${participants}, ${ptsTotal}, ${ptsMax}`);
						let newRank = RankManager.calculateRank(place, participants, ptsTotal, ptsMax);

						switch(parseInt(place)) {
							case 0:
								console.log(`With ${ptsTotal} ChP and ${ptsMax} ChP obtainable, and ${handle.displayName} does not finish a race with ${participants} players, their new rank percentage will be ${newRank}`);
								ReplyManager.newReply(`Simulation`, `With **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, and you do not finish a race with **${participants} players**, you will have **${newPtsTotal} total ChP** and **${newPtsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
								break;
							case 1:
								console.log(`With ${ptsTotal} ChP and ${ptsMax} ChP obtainable, and ${handle.displayName} finishes in 1st out of ${participants} players, their new rank percentage will be ${newRank}`);
								ReplyManager.newReply(`Simulation`, `With **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, and you finish in **1st** out of **${participants} players**, you will have **${newPtsTotal} total ChP** and **${newPtsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
								break;
							case 2:
								console.log(`With ${ptsTotal} ChP and ${ptsMax} ChP obtainable, and ${handle.displayName} finishes in 2nd out of ${participants} players, their new rank percentage will be ${newRank}`);
								ReplyManager.newReply(`Simulation`, `With **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, and you finish in **2nd** out of **${participants} players**, you will have **${newPtsTotal} total ChP** and **${newPtsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
								break;
							case 3:
								console.log(`With ${ptsTotal} ChP and ${ptsMax} ChP obtainable, and ${handle.displayName} finishes in 3rd out of ${participants} players, their new rank percentage will be ${newRank}`);
								ReplyManager.newReply(`Simulation`, `With **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, and you finish in **3rd** out of **${participants} players**, you will have **${newPtsTotal} total ChP** and **${newPtsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
								break;
							default:
								console.log(`With ${ptsTotal} ChP and ${ptsMax} ChP obtainable, and ${handle.displayName} finishes in ${place}th out of ${participants} players, their new rank percentage will be ${newRank}`);
								ReplyManager.newReply(`Simulation`, `With **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, and you finish in **${place}th** out of **${participants} players**, you will have **${newPtsTotal} total ChP** and **${newPtsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
								break;
						}
					});
				}
				else {
					ptsTotal = 0;
					ptsMax = 0;

					console.log(`Passing to RankManager: ${place}, ${participants}, ${ptsTotal}, ${ptsMax}`);
					let newRank = RankManager.calculateRank(place, participants, ptsTotal, ptsMax);

					ptsMax = parseInt(participants);
					if(parseInt(place) !== 0) {
						ptsTotal = (ptsMax - parseInt(place)) + 1;
					}

					switch(parseInt(place)) {
						case 0:
							console.log(`With no previous records, and ${handle.displayName} does not finish a race with ${participants} players, their new rank percentage will be ${newRank}`);
							ReplyManager.newReply(`Simulation`, `With no previous records, and you **do not finish** a race with **${participants} players**, you will have **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
							break;
						case 1:
							console.log(`With no previous records, and ${handle.displayName} finishes in 1st out of ${participants} players, their new rank percentage will be ${newRank}`);
							ReplyManager.newReply(`Simulation`, `With no previous records, and you finish in **1st** out of **${participants} players**, you will have **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
							break;
						case 2:
							console.log(`With no previous records, and ${handle.displayName} finishes in 2nd out of ${participants} players, their new rank percentage will be ${newRank}`);
							ReplyManager.newReply(`Simulation`, `With no previous records, and you finish in **2nd** out of **${participants} players**, you will have **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
							break;
						case 3:
							console.log(`With no previous records, and ${handle.displayName} finishes in 3rd out of ${participants} players, their new rank percentage will be ${newRank}`);
							ReplyManager.newReply(`Simulation`, `With no previous records, and you finish in **3rd** out of **${participants} players**, you will have **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
							break;
						default:
							console.log(`With no previous records, and ${handle.displayName} finishes in ${place}th out of ${participants} players, their new rank percentage will be ${newRank}`);
							ReplyManager.newReply(`Simulation`, `With no previous records, and you finish in **${place}th** out of **${participants} players**, you will have **${ptsTotal} total ChP** and **${ptsMax} obtainable ChP**, with a new rank percentage of **${newRank}**`, msgObj, `1D00FC`);
							break;
					}
				}
			});
		}
		else {
			console.log(`ERROR: Unable to obtain season`);
			ReplyManager.newReply(`Error`, `Sorry ${msgObj.member}, but there was an exception:\n\`Unable to obtain season\``, msgObj, `D43E33`);
			return 1;
		}
	});

	return 0;
}

// Blacklist Records
/** Adds a user to the blacklist records
 * @param {Discord.GuildMember} handle The person being blacklisted
 * @param {string} reason The reason for being blacklisted
 * @param {Discord.Message} msgObj Discord message object
*/
this.blacklistPlayer = function(handle, reason, msgObj) {
	redis.set(`blacklist:${handle.id}`, reason);

	console.log(`Blacklisted ${handle.displayName} (${handle.id})\nBy: ${msgObj.member.displayName}\nReason: ${reason}`);
	ReplyManager.newReply(`Blacklist`, `Blacklisted ${handle} (${handle.id})\n\nReason\n\`${reason}\``, msgObj, `1a1a1a`);
}

this.pardonPlayer = function(handle, msgObj) {
	redis.del(`blacklist:${handle.id}`).then(function(result) {
		if(result) {
			console.log(`Pardoned ${handle.displayName} (${handle.id})\nBy: ${msgObj.member.displayName}`);
			ReplyManager.newReply(`Pardon`, `Pardoned ${handle} (${handle.id})`, msgObj, `d3d3d3`);
		}
		else {
			console.log(`Pardoned ${handle.displayName} (${handle.id})... But they aren't blacklisted\nBy ${msgObj.member.displayName}`);
			ReplyManager.newReply(`Pardon`, `${handle} is not blacklisted`, msgObj, `d3d3d3`);
		}
	});
}

this.filter = function(map, link, msgObj) {
	redis.get(`blacklist:${msgObj.member.id}`).then(function(result) {
		if(result) {
			console.log(`${msgObj.member.displayName} (${msgObj.member.id}) sent in a time trial submission, but they are blacklisted`);
			ReplyManager.newReply(`Unable To Send Submission`, `Sorry ${msgObj.member}, but you are blacklisted from the time trial records\n\nReason\n\`${result}\``, msgObj, `D43E33`);
		}
		else {
			console.log(`Processing time trial submission from ${msgObj.member.displayName}\nMap: ${map}\nLink: ${link}`);
			ReplyManager.newReply(`Submission`, `Your submission has been sent and will be manually reviewed`, msgObj, `8202F9`);
			ReplyManager.newReplySpecific(`Submission`, `New submission from ${msgObj.member}\nMap: ${map}\nLink: ${link}`, msgObj, `8202F9`, Settings.channel_tts);
		}
	});
}
