const config = require('./config.json');
const Discord = require('discord.js');
const handler = require('./handler');

const discord = new Discord.Client();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

discord.on('ready', () => {
    db.get("SELECT * FROM pubg", [], (err, row) => {
        if (!err && row !== undefined) {
            handler.pubg.followMatches({
                message: {
                    author: {
                        id: row.discordId
                    },
                    channel: discord.channels.get(config.discord.channel)
                }
            });
        }
    });
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
