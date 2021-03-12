const Discord = require('discord.js');
const Settings = require('../private/settings.json');

const ranks = [Settings.role_rankSilv, Settings.role_rankGold, Settings.role_rankPlat, Settings.role_rankDiam, Settings.role_rankMast];

/** Handles all of rank calculation for the league
 * @param {number} place The finishing place of the player in the race
 * @param {number} participants The total number of participants in the race
 * @param {number} ptsTot The total points the player has obtained
 * @param {number} ptsObt The total obtainable points the player could earn
 * @returns {number} The calculated rank percentage
*/
this.calculateRank = function(place, participants, ptsTot, ptsObt) {
	if(parseInt(place) !== 0) {
		ptsTot = ptsTot + ((participants - place) + 1);
	}
	console.log(ptsTot);
	ptsObt = parseInt(ptsObt) + parseInt(participants);
	console.log(ptsObt);

	let finalRank = (ptsTot/ptsObt) * 100;

	console.log(`Rank calculated: ${finalRank}`);
	return finalRank;
}

/** Updates the rank of the player with the new rank percentage
 * @param {Discord.GuildMember} member The discord member
 * @param {number} newRank
 * @returns {number} The error status of the function. 1 = Error, 0 = No Error
*/
this.updateRank = function(member, newRank) {
	if(newRank < 50) {									// Silver
		// Check if the member has the role
		if(member.roles.cache.has(ranks[0])) {
			console.log(`${member.displayName} is already ranked in SILVER`);
		}
		// If not, then remove the other rank (if they have one) and assign the new one
		else {
			// Remove the other rank if they have one (index 0 is skipped here, but isn't elsewhere)
			for(i = 1; i < 5; i++) {
				if(member.roles.cache.has(ranks[i])) {
					member.roles.remove(member.guild.roles.cache.get(ranks[i]));
				}
			}
			member.roles.add(member.guild.roles.cache.get(ranks[0]));
			console.log(`${member.displayName} is now ranked in SILVER`);
		}
	}
	else if(newRank >= 50 && newRank < 70) {						// Gold
		if(member.roles.cache.has(ranks[1])) {
			console.log(`${member.displayName} is already ranked in GOLD`);
		}
		else {
			for(i = 0; i < 5; i++) {
				if(member.roles.cache.has(ranks[i])) {
					member.roles.remove(member.guild.roles.cache.get(ranks[i]));
				}
			}
			member.roles.add(member.guild.roles.cache.get(ranks[1]));
			console.log(`${member.displayName} is now ranked in GOLD`);
		}
	}
	else if(newRank >= 70 && newRank < 90) {						// Platinum
		if(member.roles.cache.has(ranks[2])) {
			console.log(`${member.displayName} is already ranked in PLATINUM`);
		}
		else {
			for(i = 0; i < 5; i++) {
				if(member.roles.cache.has(ranks[i])) {
					member.roles.remove(member.guild.roles.cache.get(ranks[i]));
				}
			}
			member.roles.add(member.guild.roles.cache.get(ranks[2]));
			console.log(`${member.displayName} is now ranked in PLATINUM`);
		}
	}
	else if(newRank >= 90 && newRank < 98) {						// Diamond
		if(member.roles.cache.has(ranks[3])) {
			console.log(`${member.displayName} is already ranked in DIAMOND`);
		}
		else {
			for(i = 0; i < 5; i++) {
				if(member.roles.cache.has(ranks[i])) {
					member.roles.remove(member.guild.roles.cache.get(ranks[i]));
				}
			}
			member.roles.add(member.guild.roles.cache.get(ranks[3]));
			console.log(`${member.displayName} is now ranked in DIAMOND`);
		}
	}
	else if(newRank >= 98 && newRank <= 100) {						// Grandmaster
		if(member.roles.cache.has(ranks[4])) {
			console.log(`${member.displayName} is already ranked in GRANDMASTER`);
		}
		else {
			for(i = 0; i < 5; i++) {
				if(member.roles.cache.has(ranks[i])) {
					member.roles.remove(member.guild.roles.cache.get(ranks[i]));
				}
			}
			member.roles.add(member.guild.roles.cache.get(ranks[4]));
			console.log(`${member.displayName} is now ranked in GRANDMASTER`);
		}
	}
	else {
		console.log(`ERROR: Invalid rank percentage: ${newRank}`);
		return 1;
	}

	return 0;
}
