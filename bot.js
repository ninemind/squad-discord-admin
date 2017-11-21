const config = require('./config.json');
const Discord = require('discord.js');
const Rcon = require('rcon');
const handler = require('./handler');

const discord = new Discord.Client();

const rcon = new Rcon(
    config.rcon.host,
    config.rcon.port,
    config.rcon.password,
    config.rcon.options
);

let authenticated = false;
rcon.on('auth', () => {
    if (!authenticated) {
        authenticated = true;
        console.log('Authenticated!');
    }
}).on('response', str => {
    if (str) {
        let channel = discord.channels.find('id', config.discord.channel);
        channel.send(str)
            .then(message => console.log(message.content))
            .catch(console.error);
    }
}).on('end', () => {
    rcon.connect();
});

discord.on('ready', () => {
    console.log('Bot connected!');
    rcon.connect();
}).on('message', message => {
    if (
        message.channel.id === config.discord.channel
        && message.content.startsWith(config.prefix)
    ) {
        let cmdStr = message.content.substr(config.prefix.length),
            parts = cmdStr.split(' ');

        if (parts.length >= 2) {
            let group = parts.shift(), cmd = parts.shift();

            if (
                handler.hasOwnProperty(group)
                && handler[group].hasOwnProperty(cmd)
            ) {
                let obj = {
                    message: message,
                    rcon: rcon
                };

                handler[group][cmd](obj, parts.join(' '));
            }
        }
    }
});

discord.login(config.discord.token);
