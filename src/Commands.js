const Discord = require('discord.js');

const Package = require('../package.json');
const Settings = require('../private/settings.json');
const RedisManager = require('./RedisManager.js');

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
			embed.setDescription('`!github` - Links to the GitHub repository for this bot\n`!help` - Displays this menu\n`!maps` - Displays the playable maps in the league\n`!standings` - Gets the current standings of the season\n`!stats [discord handle]` - Gets the current season stats of the pinged player\n`!leaderboard [map] [start (default: 1)] [end (default: 10)]` - Gets the time trial leaderboard of the map\n`!submit [map] [video link]` - Submits a time trial record for manual review');
			embed.setColor('00E3FF');
			msg.channel.send(embed);
			break;

		// !maps
		case 'maps':
			RedisManager.getMaps(msg);
			break;

		// Race Record Commands
		// !history [handle] [season] [start] [end]
		case 'history':
			if(args.length === 5) {
				let member = msg.mentions.members.first();

				RedisManager.getRaceHistory(member, args[2], parseInt(args[3]) - 1, parseInt(args[4]) - 1, msg);
			}
			else if(args.length === 3) {
				let member = msg.mentions.members.first();

				RedisManager.getRaceHistory(member, args[2], 0, 9, msg);
			}
			else if(args.length === 2) {
				let member = msg.mentions.members.first();

				RedisManager.getRaceHistory(member, 'UseCurrent', 0, 9, msg);
			}
			else if(args.length === 1) {
				RedisManager.getRaceHistory(msg.member, 'UseCurrent', 0, 9, msg);
			}
			else {
				embed.setTitle('Error');
                                embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!history [handle] [season (default is the current season)] [start (default is 1)] [end (default is 10)]\``);
                                embed.setColor('D43E33');
                                msg.channel.send(embed);
			}
			break;

		// !simulate [place] [participants]
		case 'simulate':
			if(args.length === 3) {
				RedisManager.getSimulation(msg.member, args[1], args[2], msg);
			}
			else {
				embed.setTitle(`Error`);
				embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!simulate [place] [participants]\``);
				embed.setColor(`D43E33`);
				msg.channel.send(embed);
			}
			break;

		// !standings
		case 'standings':
			break;

		// !stats [handle] [season]
		case 'stats':
			if(args.length === 3) {

			}
			else if(args.length === 2) {

			}
			else {
				embed.setTitle('Error');
                                embed.setDescription(`Sorry ${msg.member}, but you are missing arguments\nUsage: \`!stats [handle] [season (default is the current season)]\``);
                                embed.setColor('D43E33');
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
			if(args.length === 3) {
				if(args[1].indexOf('https') === -1 && args[2].indexOf('https') != -1) {
					embed.setTitle('Submission');
					embed.setDescription('Successfully sent time trial submission... Your submission will be manually approved in due time...');
					embed.setColor('8202F9');
					msg.channel.send(embed);

					msg.guild.channels.cache.get(Settings.channel_tts).send(`New time trial from ${msg.member} for **${args[1]}**:\n${args[2]}`);
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
			break;

		// Fun Commands
		// !angery
		case 'angery':
			break;

		// Admin Commands
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
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage:\`!addmap [map] [author]\``);
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
			if(msg.member.roles.cache.has(Settings.role_administrator)) {
				if(args.length === 5) {
					RedisManager.newTimeTrialRecord(args[1], args[3], args[2], args[4], msg);

					embed.setTitle('Time Trial Record');
					embed.setDescription(`Added time trial record`);
					embed.setColor('00E3FF');
					msg.channel.send(embed);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage\`!addrecord [name] [map] [total time] [video]\``);
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
					let handle = msg.mentions.members.first();

					RedisManager.addStats(handle, args[2], args[3], args[4], msg);
				}
				else {
					embed.setTitle('Error');
					embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage\`!addstats [discord handle] [place] [participants] [map]\``);
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
