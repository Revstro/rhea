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
			embed.setDescription('`!github` - Links to the GitHub repository for this bot\n`!help` - Displays this menu');
			embed.setColor('00E3FF');
			msg.channel.send(embed);
			break;

		// Time Trial Commands
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
			}
			else {
				embed.setTitle('Error');
				embed.setDescription(`Sorry ${msg.member}, but you are missing some arguments\nUsage: \`!submit [map] [video link]\`\n*Shortened URLs are unacceptable*`);
				embed.setColor('D43E33');
				msg.channel.send(embed);
			}
			break;

		// Fun Commands
		// !angery
		case 'angery':
			break;

		// Admin Commands
		// !redistest
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
