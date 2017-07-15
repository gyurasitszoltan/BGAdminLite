/**
 * Created by Gyurasits Zoltán on 2016.08.18..
 */

exports.dependencies = ['rconService'];

var inGameFeedEnable = F.config['default-user-feed'];

exports.install = function() {
    console.log('Install USER service');

    var self = this;

    F.on('rconmessage', function(msg) {

        //console.log(msg);

        var joinRE          = new RegExp(/^([0-9]+(?:\.[0-9]+){3}):([0-9]+)\/([0-9]{17})\/(.+) joined \[(.+)\/[0-9]{17}\]/);
        var disconnectRE    = new RegExp(/^([0-9]+(?:\.[0-9]+){3}):([0-9]+)\/([0-9]{17})\/(.+) disconnecting: (.+)/);
        var kickRE          = new RegExp(/^([0-9]+(?:\.[0-9]+){3}):([0-9]+)\/([0-9]{17})\/(.+) kicked: (.+)/);
        var rejectConnRE    = new RegExp(/^([0-9]+(?:\.[0-9]+){3}):([0-9]+)\/([0-9]{17})\/(.+) Rejecting connection - (.+)/);
        var chatRE          = new RegExp(/(^\[CHAT\]) +(.+?)\[([0-9]+)\/([0-9]+)\] +: +(.+)/);

        var data = null;

        if( data = kickRE.exec(msg) ) {
            console.log(data);
        }

        var data = null;

        if( data = chatRE.exec(msg) ) {
            userChat(data);

        } else if( data = joinRE.exec(msg) ) {
            userJoin(data);

        } else if( data = disconnectRE.exec(msg) ) {
            userDisconnect(data);

        } else if( data = kickRE.exec(msg) ) {
            userKick(data);

        } else if( data = rejectConnRE.exec(msg) ) {
            userRejectConnection(data);
        }

    });

};

//////
//////    CHAT
//////
//////////////////////////////////////////////////////////////////

function userChat(data) {
    var user = data[2];
    var steamid = data[4];
    var text = data[5];
    var text2 = data[5].toLowerCase();

    if(F.isAdmin(steamid)) {
        if(text2 == ".ingameuserfeed enable") {
            if(!inGameFeedEnable) {
                inGameFeedEnable = true;
                F.global.rcon.service.Command('say <color=yellow>In-game játékos feed bekapcsolva!</color>');
            }
        } else if(text2 == ".ingameuserfeed disable") {
            if(inGameFeedEnable) {
                inGameFeedEnable = false;
                F.global.rcon.service.Command('say <color=yellow>In-game játékos feed kikapcsolva!</color>');
            }
        }
    }


}

//////
//////    JOIN
//////
//////////////////////////////////////////////////////////////////

function userJoin(data) {

    var ip      = data[1];
    var steamid = data[3];
    var name    = data[4];

    console.log("USER SERVICE: " + name + " betoppant. Szia " + name + ".");

    if(inGameFeedEnable) {
        F.global.rcon.service.Command('say <color=green>' + name + " betoppant. Szia " + name + ".</color>");
    }

}

//////
//////    DISCONNECT
//////
//////////////////////////////////////////////////////////////////

function userDisconnect(data) {


    var ip      = data[1];
    var steamid = data[3];
    var name    = data[4];

    console.log("USER SERVICE: " + name + " itt hagyott minket.");
    if(inGameFeedEnable) {
        F.global.rcon.service.Command('say <color=yellow>' + name + " itt hagyott minket.</color>");
    }
}

//////
//////    KICK
//////
//////////////////////////////////////////////////////////////////

function userKick(data) {

    var ip          = data[1];
    var steamid     = data[3];
    var name        = data[4];
    var reason      = data[5];

    console.log("USER SERVICE: " + name + " ki lett rúgva.");
    if (inGameFeedEnable) {
        F.global.rcon.service.Command('say <color=blue>' + name + " itt hagyott minket.</color>");
    }
}

//////
//////    REJECTING CONNECTIONS
//////
//////////////////////////////////////////////////////////////////


function userRejectConnection(data) {

    var ip          = data[1];
    var steamid     = data[3];
    var name        = data[4];
    var reason      = data[5];

    console.log("USER SERVICE: " + name + " rejecting connection.");


}



exports.getUsers = function (callback, updateDB, updateID) {

    console.log("USER SERVICE: refresh users status");

    F.global.rcon.service.Command('playerlist', function(msg) {

        /*
         "SteamID": "123456",
         "OwnerSteamID": "0",
         "DisplayName": "xyz",
         "Ping": 14,
         "Address": "x.x.x.x:62769",
         "ConnectedSeconds": 12717,
         "VoiationLevel": 0.0,
         "CurrentLevel": 28.0,
         "UnspentXp": 138.0,
         "Health": 74.7739639
         */

        var users = JSON.parse(msg);

        if(callback != null) {
            callback(users);
        }

        return true;
    });

    return false;
}

