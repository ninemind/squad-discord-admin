let _isId = (str) => {
    return !isNaN(str) && str.length <= 3;
};

module.exports = {

    list: (obj, args) => {
        obj.rcon.send('ListPlayers');
    },

    ban: (obj, args) => {
        let cmd = 'AdminBan',
            parts = args.split(' ');

        if (
            parts.length
            && _isId(parts[0])
        ) {
            cmd += 'ById';
        }

        obj.rcon.send(cmd + ' ' + args);
    },

    kick: (obj, args) => {
        let cmd = 'AdminKick',
            parts = args.split(' ');

        if (
            parts.length
            && _isId(parts[0])
        ) {
            cmd += 'ById';
        }

        obj.rcon.send(cmd + ' ' + args);
    },

    swap: (obj, args) => {
        let cmd = 'AdminForceTeamChange',
            parts = args.split(' ');

        if (
            parts.length
            && _isId(parts[0])
        ) {
            cmd += 'ById';
        }

        obj.rcon.send(cmd + ' ' + args);
    }

};
