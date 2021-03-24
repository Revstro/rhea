const Discord = require('discord.js');

const Package = require('../package.json');
const Settings = require('../private/settings.json');
const RedisManager = require('./RedisManager.js');
const FunThings = require('./FunThings.js');

const attachment = new Discord.MessageAttachment('./img/orl_logo.png', 'orl_logo.png');

/**
 * @param {Message} msg Discord message object
 * @param {string} args Arguments of the message (array)
 */
this.cmd = function(msg, args) {
	let cDate = new Date();

	let embed = new Discord.MessageEmbed();
	embed.setTimestamp(cDate);
	embed.setFooter('Rhea', 'attachment://orl_logo.png');
	embed.attachFiles(attachment);

	switch(args[0].toLowerCase()) {
		// Normal Commands
		// !season
		case 'season':
			RedisManager.getSeason(msg);
			break;

		// !github
		case 'github':
			embed.setTitle('GitHub');
			embed.setDescription('https://github.com/Revstro/rhea \n\n*NOTE: The repository is currently private. Once the full version of the bot has been released, it will become public*');
			embed.setColor('24D48A');
			msg.channel.send(embed);
			break;
		// !help
		case 'help':
			embed.setTitle('Help Menu');
			embed.setDescription('**Regular**\n`!github` - Links to the GitHub repository for this bot\n`!help` - Displays this menu\n`!map [map name]` - Displays details about [map name]\n`!maps` - Displays the playable maps in the league\n`!season` - Displays the current season\n\n**Race Records**\n`!history [handle] [start (1)] [end (10)] [season (current season)]` - Gets the recent games of a player\n`!simulate [place] [participants]` - Simulates a game and its affect on your rank\n`!standings [season (current season)]` - Gets the standings of the current or a specific season\n`!stats [handle] [season (current season)]` - Gets the stats of a player in the current or a specific season\n\n**Time Trials**\n`!leaderboard [map] [start (1)] [end (10)]` - Gets the time trial leaderboard of a map\n`!submit [map] [link]` - Submits a time trial record for manual review`');
			embed.setColor('00E3FF');
			msg.channel.send(embed);
			break;

		// !maps
		case 'maps':
			RedisManager.getMaps(msg);
			break;

		// !map [map name]
		case 'map':
			if(args.length === 2) {
				RedisManager.getMapDetail(args[1], msg);
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!map [map name]\``);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// Race Record Commands
		// !history [handle] [season] [start] [end]
		case 'history':
			if(msg.channel.type != "dm") {
				if(args.length === 5) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getRaceHistory(member, args[4], parseInt(args[2]) - 1, parseInt(args[3]) - 1, msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 4) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getRaceHistory(member, 'UseCurrent', parseInt(args[2]) - 1, parseInt(args[3]) - 1, msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 3) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getRaceHistory(member, args[2], 0, 9, msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 2) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getRaceHistory(member, 'UseCurrent', 0, 9, msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 1) {
					RedisManager.getRaceHistory(msg.member, 'UseCurrent', 0, 9, msg);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!history [handle] [start (default is 1)] [end (default is 10)] [season (default is the current season)]\`\nOR\n\`!history [handle] [season (default is the current season)]\``);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry, but that command cannot be used in a DM\nPlease use it on the server`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !simulate [place] [participants]
		case 'simulate':
			if(msg.channel.type != "dm") {
				if(args.length === 3) {
					RedisManager.getSimulation(msg.member, args[1], args[2], msg);
				}
				else {
					embed.setTitle(`Error`);
					embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!simulate [place] [participants]\``);
					embed.setColor(`D43E33`);
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry, but that command cannot be used in a DM\nPlease use it on the server`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !standings [season]
		case 'standings':
			if(args.length === 2) {
				RedisManager.getStandings(args[1], 0, 49, msg);
			}
			else {
				RedisManager.getStandings("UseCurrent", 0, 49, msg)
			}
			break;

		// !stats [handle] [season]
		case 'stats':
			if(msg.channel.type != "dm") {
				if(args.length === 3) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getPlayerStats(member, args[2], msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 2) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.getPlayerStats(member, "UseCurrent", msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else if(args.length === 1) {
					RedisManager.getPlayerStats(msg.member, "UseCurrent", msg);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!stats [handle] [season (default is the current season)]\``);
	                                embed.setColor('D43E33');
	                                msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry, but that command cannot be used in a DM\nPlease use it on the server`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// Time Trial Commands
		// !leaderboard [map name] [start] [end]
		case 'leaderboard':
			if(args.length === 4) {
				RedisManager.getTimeTrialRecords(args[1], args[2]-1, args[3]-1, msg);
			}
			else if(args.length === 2) {
				RedisManager.getTimeTrialRecords(args[1], 0, 9, msg);
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!leaderboard [map] [start (default is 1)] [end (default is 10)]\``);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !submit [map name] [video link]
		case 'submit':
			if(msg.channel.type != "dm") {
				if(args.length === 3) {
					if(args[1].indexOf('https') === -1 && args[2].indexOf('https') != -1) {
						RedisManager.filter(args[1], args[2], msg);
					}
					else {
						embed.setTitle('Error');
						embed.setDescription(`Sorry ${msg.member}, but you've formatted the command wrong (map name first, video link second)`);
						embed.setColor('D43E33');
						msg.channel.send(embed);
					}
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!submit [map] [video link]\``);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry, but that command cannot be used in a DM\nPlease use it on the server`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// Fun Commands
		// !angery
		// Oh now you've done it...
		case 'angery':
			msg.channel.send('<:rh_angery:732424672553074760>');
			break;

		// !linux
		// Rhea gives you "good" linux advice
		case 'linux':
			embed.setTitle(`Linux Advice`);
			embed.setDescription(FunThings.linuxAdvice());
			embed.setColor(`00E3FF`);
			msg.channel.send(embed);
			break;

		// Admin Commands
		case 'adminhelp':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				embed.setTitle(`Admin Help Menu`);
				embed.setDescription('**Debug Commands**\n`!echo [arguments]` - Tests the console output\n`!redistest` - Tests the redis database\n`!save` - Saves the database\n\n**Race Records**\n`!addstats [handle] [place] [participants] [map]` - Adds a race record to the player stats\n\n**Time Trials**\n`!blacklist [handle] [reason]` - Blacklists a player from the time trial records\n`!addmap [map] [author]` - Adds a map to the map database\n`!addrecord [name] [map] [time] [video link]` - Adds a time trial record to the database\n`!pardon [handle]` - Pardons a player from the blacklist');
				embed.setColor(`00E3FF`);
				msg.channel.send(embed);
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !echo [arguments]
		// Tests console output
		case 'echo':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length >= 2) {
					for(i = 1; i < args.length; i++) {
						console.log(args[i]);
					}
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you must pass some arguments`);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !redistest
		// Tests the redis database
		case 'redistest':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				RedisManager.testSet();

				embed.setTitle('Redis Test');
				embed.setDescription(`Testing the Redis database (check logs)`);
				embed.setColor('00E3FF');
				msg.channel.send(embed);
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !addmap [map] [author]
		// Adds a map to the database
		case 'addmap':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 3) {
					RedisManager.newMap(args[1], args[2]);

					embed.setTitle('Added Map');
					embed.setDescription(`Added ${args[1]} by ${args[2]}`);
					embed.setColor('00E3FF');
					msg.channel.send(embed);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!addmap [map] [author]\``);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !addrecord [name] [map] [total time] [video]
		// Adds a time trial record to the database
		case 'addrecord':
			if(msg.member.roles.cache.has(Settings.role_administrator) || msg.member.roles.cache.has(Settings.role_ttrmoderator)) {
				if(args.length === 5) {
					RedisManager.newTimeTrialRecord(args[1], args[3], args[2], args[4], msg);

					embed.setTitle('Time Trial Record');
					embed.setDescription(`Added time trial record`);
					embed.setColor('00E3FF');
					msg.channel.send(embed);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!addrecord [name] [map] [total time] [video]\``);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !addstats [handle] [place] [participants] [map]
		// Adds a race record to the database
		case 'addstats':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 5) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.addStats(member, args[2], args[3], args[4], msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!addstats [handle] [place] [participants] [map]\``);
					embed.setColor('D43E33');
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// !blacklist [handle] [reason]
		// Blacklists a player from submitting time trials
		case 'blacklist':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 3) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.blacklistPlayer(member, args[2], msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else {
					embed.setTitle(`Error`);
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!blacklist [handle] [reason]\``);
					embed.setColor(`D43E33`);
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !pardon [handle]
		// Pardons a player from a blacklist
		case 'pardon':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 2) {
					let member = msg.mentions.members.first();
					if(member) {
						RedisManager.pardonPlayer(member, msg);
					}
					else {
						embed.setTitle(`Error`);
						embed.setDescription(`Sorry ${msg.member}, but I can't find that person`);
						embed.setColor(`D43E33`);
						msg.channel.send(embed);
					}
				}
				else {
					embed.setTitle(`Error`);
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!pardon [handle]\``);
					embed.setColor(`D43E33`);
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !save
		// Saves the database
		case 'save':
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				RedisManager.save(msg);
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !setperfectlap [map name] [time]
		// Sets the perfect lap time for a map
		case `setperfectlap`:
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 3) {
					RedisManager.setPerfectLap(args[1], args[2], msg);
				}
				else {
					embed.setTitle(`Error`);
					embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!setperfectlap [map] [time]\``);
					embed.setColor(`D43E33`);
					msg.channel.send(embed);
				}
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you aren't permitted to use this command`);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// default response
		default:
			console.log(`Unknown command by ${msg.member.displayName}: ${args[0]}`);

			embed.setTitle('Error');
			embed.setDescription(`Sorry ${msg.member}, but I don't know what "${args[0]}" means`);
			embed.setColor('D43E33');
			msg.channel.send(embed);
			break;
	}
}
