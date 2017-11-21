const config = require('../config.json');
const helpFile = require('../help.json');

module.exports = {

    clear: (obj, args) => {
        obj.message.channel.fetchMessages({limit: 100})
            .then(messages => {
                let messagesArr = messages.array();
                messagesArr.forEach(msg => {
                    msg.delete();
                });
            })
            .catch(console.error);
    },

    help: (obj, arg) => {
        if (arg !== undefined) {
            for (let k in helpFile) {
                helpFile[k].forEach(cmd => {
                    if (cmd.cmd === arg) {
                        let params = '';
                        if (cmd.params !== undefined && cmd.params.length) {
                            params = '`{' + cmd.params.join('}` `{') + '}`';
                        }

                        obj.message.channel
                            .send({
                                embed: {
                                    color: 3447003,
                                    title: 'command',
                                    description: config.prefix  + k + ' ' + cmd.cmd + ' ' + params,
                                    fields: [
                                        {
                                            name: "description",
                                            value: cmd.help
                                        }
                                    ],
                                    footer: {
                                        text: cmd.example === undefined ? '' : 'Example: ' + config.prefix  + k + ' ' + cmd.cmd + ' ' + cmd.example
                                    }
                                }
                            })
                            .then(message => console.log(message.content))
                            .catch(console.error);
                    }
                });
            }
        } else {
            let fields = [];

            for (let k in helpFile) {
                let help = {
                    name: k
                };

                let groupCommands = [];
                helpFile[k].forEach(cmd => {
                    let params = '';
                    if (cmd.params !== undefined && cmd.params.length) {
                        params = '`{' + cmd.params.join('}` `{') + '}`';
                    }

                    groupCommands.push(config.prefix  + k + ' ' + cmd.cmd + ' ' + params);
                });

                help.value = groupCommands.join("\n");

                fields.push(help);
            }

            obj.message.channel
                .send({
                    embed: {
                        color: 3447003,
                        title: 'Help',
                        description: 'Bot prefix is `' + config.prefix + '`',
                        fields: fields,
                        footer: {
                            text: 'For more information try ' + config.prefix + 'bot help ' + '{Command}'
                        }
                    }
                })
                .then(message => console.log(message.content))
                .catch(console.error);
        }
    }

};
