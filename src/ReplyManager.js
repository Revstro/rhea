const Discord = require('discord.js');

const Settings = require('../private/settings.json');

const attachment = new Discord.MessageAttachment('./img/orl_logo.png', 'orl_logo.png');

let embed = new Discord.MessageEmbed();
embed.setFooter('Rhea', 'attachment://orl_logo.png');
embed.attachFiles(attachment);

this.newReply = function(title, msg, msgObj, color) {
	embed.setTimestamp(Date.now());
	embed.setTitle(title);
	embed.setDescription(msg)
	embed.setColor(color);

	msgObj.channel.send(embed);
}
