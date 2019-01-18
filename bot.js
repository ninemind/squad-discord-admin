const config = require('./config.json');
const Discord = require('discord.js');
const handler = require('./handler');

const discord = new Discord.Client();

discord.on('ready', () => {
    console.log(config.name + ' connected!');
}).on('message', message => {
    if (
        message.channel.id === config.discord.channel
        && message.content.startsWith(config.prefix)
    ) {
        let cmdStr = message.content.substr(config.prefix.length),
            parts = cmdStr.split(' '),
            group = parts.shift(),
            cmd = parts.shift();

        if (!handler.hasOwnProperty(group)) {
            cmd = group;
            group = 'bot';
        }

        if (handler[group].hasOwnProperty(cmd)) {
            let obj = {
                message: message
            };

            handler[group][cmd](obj, parts.join(' '));
        }
    }
});

discord.login(config.discord.token);
