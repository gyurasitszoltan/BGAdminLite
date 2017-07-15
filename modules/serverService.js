/**
 * Created by Gyurasits Zoltán on 2016.08.18..
 */

exports.dependencies = ['rconService'];

var lastSaveTime    = null;
var lastEntsCount   = null;

exports.install = function() {
    var self = this;
    console.log('Install SERVER service');

    F.on('rconmessage', function(msg) {

        var saveRE       = new RegExp(/^Saved (.+) ents, serialization\((.+)\), write\((.+)\), disk\((.+)\) totalstall\((.+)\)/);

        if((data = saveRE.exec(msg))) {
            console.log("Jatek adatai elmentve!");
            F.global.rcon.service.Command('say <color=yellow>Játékállás elmentve!</color>');

            lastSaveTime = new Date().format('yyyy-mm-dd HH:MM:ss');
            lastEntsCount = data[1];
        }

    });

};

exports.getServerInfo = function(callback, emit) {

    console.log("SERVER SERVICE: refresh server info");

    if(F.global.rcon.service.isConnected) {

        F.global.rcon.service.Command('serverinfo', function(msg) {

            var info = JSON.parse(msg);

            info.lastSaveTime = lastSaveTime;

            if(callback != null) {
                callback(info);
            }
        });
    }

}
