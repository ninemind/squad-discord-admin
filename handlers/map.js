const request = require('request');

module.exports = {

    list: (obj, args) => {
        request({
            uri: "https://gist.githubusercontent.com/ninemind/6526a442c2a4a8d26ba4780d16159f7d/raw/d11ac2d1d1527cdefea623fc7235954adc35cb6a/gistfile1.txt"
        }, function (err, res, body) {
            obj.message.channel
                .send(body)
                .then(message => console.log(message.content))
                .catch(console.error);
        });
    },

    change: (obj, args) => {
        obj.rcon.send('AdminChangeMap ' + args);
    },

    next: (obj, args) => {
        obj.rcon.send('AdminSetNextMap ' + args);
    }

};
