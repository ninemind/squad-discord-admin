module.exports = {

    broadcast: (obj, args) => {
        let nickname = obj.message.member.nickname;

        obj.rcon.send('AdminBroadcast ' + nickname + ': ' + args);
    },

    restart: (obj, args) => {
        obj.rcon.send('AdminRestartMatch');
    },

    end: (obj, args) => {
        obj.rcon.send('AdminEndMatch');
    }

};
