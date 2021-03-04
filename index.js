const Discord = require('discord.js');
const Settings = require('./private/settings.json');
const Commands = require('./src/Commands.js');

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

client.on('message', msg =>{
	let args = msg.content.substring(PREFIX.length).split(' ');

	if(msg.content.substring(0, 1) === '!') {
		switch(args[0]) {
			case 'shutdown':
				console.log(`Shutdown in progress... Started by ${msg.member.displayName}`);
				if(msg.member.roles.cache.has(Settings.role_administrator)) {
					setTimeout(function() {
						client.destroy();
						console.log(`Shutdown complete... Have a nice day`);
					}, 10000)
				}
				break;
			default:
				Commands.cmd(msg, args);
				break;
		}
	}
})

client.on('error', error =>{
	console.log(`ERROR: ${error.message}`);
})

client.login(token);
