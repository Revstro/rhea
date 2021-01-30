const Discord = require('discord.js');
const Settings = require('./private/settings.json');

const client = new Discord.Client();
const token = Settings.token;
const PREFIX = '!';

let embed = new Discord.MessageEmbed();

client.on('ready', ()=>{
	embed.setTimestamp(Date.now());
	
	embed.setTitle('Online');
	embed.setDescription('Rhea is online');
	embed.setColor('4CE31E');
	client.channels.cache.get(Settings.channel_rheastatus).send(embed);

	console.log('Rhea is online...')
})

client.login(token);
