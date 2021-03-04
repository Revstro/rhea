const Discord = require('discord.js');

const Package = require('./package.json');
const Settings = require('../private/settings.json');

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
		// !help
		case 'help':
			embed.setTitle('Help Menu');
			embed.setDescription('`!github` - Links to the GitHub repository for this bot\n`!help` - Displays this menu');
			embed.setColor('00E3FF');
			msg.channel.send(embed);
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
