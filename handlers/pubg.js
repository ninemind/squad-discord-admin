const config = require('../config.json');
const request = require('request');
const moment = require('moment');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

const Discord = require('discord.js');

const call = (endpoint, callback) => {
    request(
        config.games.pubg.baseUrl + endpoint,
        {
            json: true,
            headers: {
                Authorization: ' Bearer ' + config.games.pubg.apiKey
            }
        },
        function (err, res, body) {
            if (!err) {
                if (body.hasOwnProperty('errors')) {
                    body.errors.forEach(function(e) {
                        obj.message.channel
                            .send(e.title)
                            .then(message => console.log(message.content))
                            .catch(console.error);
                    });
                } else {
                    callback(body);
                }
            } else {
                obj.message.channel
                    .send('An error occurred.')
                    .then(message => console.log(message.content))
                    .catch(console.error);
            }
        }
    );
};

pubgId = (discordId, callback) => {
    db.get("SELECT * FROM pubg WHERE discordId = ?", [discordId], (err, row) => {
        if (err || row === undefined) {
            callback(true, null);
        } else {
            callback(false, row.pubgId);
        }
    });
};

module.exports = {

    track: (obj, playerName) => {
        call('players?filter[playerNames]=' + playerName, (body) => {
            // TODO: force untrack of previous pubgId first?

            db.run("INSERT INTO pubg (discordId, pubgId) VALUES (?, ?)", [
                obj.message.author.id,
                body.data[0].id
            ], (err) => {
                if (!err) {
                    obj.message.channel
                        .send('Successfully tracking player: ' + playerName)
                        .then(message => console.log(message.content))
                        .catch(console.error);

                    module.exports.followMatches(obj);
                }
            });
        });
    },

    followMatches: (obj, args) => {
        let interval = setInterval(() => {
            module.exports.lastMatch(obj, args);

            // TODO cancel interval if it fails
        }, 60 * 1000);
    },

    lastMatch: (obj, args) => {
        pubgId(obj.message.author.id, (err, pubgId) => {
            if (err) {
                obj.message.channel
                    .send('Please start tracking a PUBG player using: ' + config.prefix + 'pubg track `{PlayerName}`')
                    .then(message => console.log(message.content))
                    .catch(console.error);
            } else {
                call('players/' + pubgId, (body) => {
                    let lastMatchId = body.data.relationships.matches.data[0].id;

                    db.run("INSERT INTO matches (match_id) VALUES (?)", [lastMatchId], (err) => {
                        if (err) {
                            // console.log('Already shown match: ' + lastMatchId);
                        } else {
                            call('matches/' + lastMatchId, (body) => {
                                let me = body.included.find(o => o.type === 'participant' && o.attributes.stats.playerId === pubgId),
                                    roster = body.included.find(o => o.type === 'roster' && o.attributes.stats.rank === me.attributes.stats.winPlace),
                                    participants = roster.relationships.participants.data.map((v, k) => v['id']),
                                    teammates = body.included.filter(o => o.type === 'participant' && participants.includes(o.id)),
                                    totalTeams = body.included.filter(o => o.type === 'roster').length;

                                let thumbnail = null;
                                switch (body.data.attributes.mapName) {
                                    case 'Savage_Main':
                                        thumbnail = 'https://www.pubgmap.com/images/pubgmap-savage-500x500.jpg';
                                        break;

                                    case 'Erangel_Main':
                                        thumbnail = 'https://www.pubgmap.com/images/pubgmap-erangel-500x500-new.jpg';
                                        break;

                                    case 'Miramar_Main':
                                        thumbnail = 'https://www.pubgmap.com/images/pubgmap-miramar-500x500.jpg';
                                        break;

                                    case 'DihorOtok_Main':
                                        thumbnail = 'https://www.pubgmap.com/images/pubgmap-vikendi-500x500.jpg';
                                        break;

                                    default:
                                        thumbnail = 'http://www.stickpng.com/assets/images/5a461410d099a2ad03f9c998.png';
                                }

                                let duration = moment.duration(body.data.attributes.duration * 1000);

                                const embed = new Discord.RichEmbed()
                                    .setTitle('Your team placed #' + roster.attributes.stats.rank + '/' + totalTeams)
                                    .setTimestamp(body.data.attributes.createdAt)
                                    // .setImage('https://cdn.pbrd.co/images/HF9DvIK.png')
                                    .setFooter('Duration: ' + duration.humanize())
                                    .setThumbnail(thumbnail)
                                ;

                                teammates.forEach((teammate) => {
                                    let survived = moment.duration(teammate.attributes.stats.timeSurvived * 1000),
                                        fields = {
                                            Survived:       survived.humanize(),
                                            Knocked:        teammate.attributes.stats.DBNOs,
                                            Kills:          teammate.attributes.stats.kills,
                                            Assists:        teammate.attributes.stats.assists,
                                            Headshots:      teammate.attributes.stats.headshotKills,
                                            'Damage Dealt': Math.round(teammate.attributes.stats.damageDealt),
                                            'Longest Kill': teammate.attributes.stats.longestKill.toFixed(2),
                                            Revives:        teammate.attributes.stats.revives
                                        };

                                    let fieldData = '';
                                    for (let property in fields) {
                                        fieldData += (property + ': ').padEnd(18, ' ') + fields[property] + "\n";
                                    }

                                    embed.addField(teammate.attributes.stats.name, "```\n" + fieldData + "```", true);
                                });

                                obj.message.channel.send({embed});
                            });
                        }
                    });
                });
            }
        });
    }
};
