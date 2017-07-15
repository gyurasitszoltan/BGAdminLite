/**
/**
 * Created by Gyurasits Zoltán on 2016.08.18..
 */

exports.dependencies = ['rconService'];

var feeds = new Array();
var inGameFeedEnable = F.config['default-killfeed'];

exports.install = function() {

    console.log('Install KILLFEED service');

    var killedRE      = new RegExp(/^(.+?)\[[0-9]+\/([0-9]+)\] was killed by (.+?)\[[0-9]+\/([0-9]+)\]/);
    var killedNpcRE   = new RegExp(/^(.+?)\[[0-9]+\/[0-9]+\] was killed by (.+?)\.prefab \((\w+)\)/);
    var diedRE        = new RegExp(/^(.+?)\[[0-9]+\/([0-9]+)\] was suicide by (\w+)/);
    var diedRE2       = new RegExp(/^(.+?)\[[0-9]+\/([0-9]+)\] was killed by (\w+)/);
    var diedRE3       = new RegExp(/^(.+?)\[[0-9]+\/([0-9]+)\] died \((\w+)\)/);

    F.on('rconmessage', function(msg) {

        if(feeds.length == 0) {
            for(var i = 0; i < F.global.entities.length;i++){
                feeds[F.global.entities[i]["name"]] =  F.global.entities[i]["killfeed"];
            }
        }

        var chatRE = new RegExp(/(^\[CHAT\]) +(.+?)\[([0-9]+)\/([0-9]+)\] +: +(.+)/);
        if((data = chatRE.exec(msg))) {

            var user = data[2];
            var steamid = data[4];
            var text = data[5].toLowerCase();

            if(F.isAdmin(steamid)) {
                if(text == ".ingamekillfeed enable") {
                    if(!inGameFeedEnable) {
                        inGameFeedEnable = true;
                        F.global.rcon.service.Command('say <color=yellow>In-game killfeed bekapcsolva!</color>');
                    }
                } else if(text == ".ingamekillfeed disable") {
                    if(inGameFeedEnable) {
                        inGameFeedEnable = false;
                        F.global.rcon.service.Command('say <color=yellow>In-game killfeed kikapcsolva!</color>');
                    }
                }
            }

        }

        if((data = killedRE.exec(msg))) {
            console.log("KILLFEED (kill): " + data[3] + " => " + data[1]);

            if(inGameFeedEnable) {
                F.global.rcon.service.Command('say <color=red>'+ data[3] + "</color> elkente <color=yellow>"+data[1]+"</color> száját.");
            }

        } else {
            if((names = killedNpcRE.exec(msg))) {
                console.log("KILLFEED (kill by NPC): " + names[1] + " => " + names[2]);

            } else {
                if ((data = diedRE.exec(msg))) {
                    console.log("KILLFEED (suicide): " + data[1]);

                    if(inGameFeedEnable) {
                        F.global.rcon.service.Command('say <color=yellow>' + data[1] + "</color> öngyilkos lett.");
                    }

                } else {
                    if ((data = diedRE2.exec(msg)) || (data = diedRE3.exec(msg))) {

                        var reason = data[3].toLowerCase();

                        if(feeds[reason]) {
                            reason = rr(feeds[reason]);
                        } else {
                            reason = ' died off ' + data[3];
                        }

                        console.log("KILLFEED (kill by entity): " + data[1] + " => " + reason);

                        if(inGameFeedEnable) {
                            F.global.rcon.service.Command('say <color=red>' + data[1] + "</color> " + reason);
                        }
                    }
                }
            }
        }
    });

};

var random = require("random-js")();

function rr(reasons) {
    var r = random.integer(0, reasons.length - 1);
    return reasons[r];
}

