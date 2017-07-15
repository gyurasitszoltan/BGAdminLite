/**
 * Created by Gyurasits Zoltán on 2016.08.18..
 */

exports.dependencies = ['rconService','userService','npcService','serverService'];

var blacklist = [];

exports.install = function() {
    console.log('Install BOT service');
    var self = this;

    var userService     = F.module('userService');
    var npcService      = F.module('npcService');
    var serverService   = F.module('serverService');

    var nosql = NOSQL('blacklist');

    nosql.find().make(function(builder) {
        builder.callback(function(err, response) {
            for(var i = 0; i < response.length;i++){
                blacklist.push(response[i].steamid);
            }
        });
    });

    F.on('rconmessage', function(msg) {

        var chatRE = new RegExp(/(^\[CHAT\]) +(.+?)\[([0-9]+)\/([0-9]+)\] +: +(.+)/);

        if((data = chatRE.exec(msg))) {

            var user    = data[2];
            var steamid = data[4];
            var text    = data[5].toLowerCase();

            if(text != "" && text.charAt(0) == ".") {

                if(blacklist.indexOf(steamid) == -1) {

                    var infoRE1     = new RegExp(/^\.info$/);
                    var infoRE2     = new RegExp(/^\.info +(.+)/);
                    var kickRE      = new RegExp(/^\.kick +(.+)/);
                    var banRE1      = new RegExp(/^\.ban +(.+)/);
                    var muteRE1     = new RegExp(/^\.mute +(.+)/);
                    var unmuteRE    = new RegExp(/^\.unmute +(.+)/);
                    var helpRE      = new RegExp(/^\.help$/);
                    var addblRE     = new RegExp(/^\.addbl +(.+)/);
                    var delblRE     = new RegExp(/^\.delbl +(.+)/);


                    if((data = infoRE1.exec(text))) {
                        F.global.rcon.service.Command("say <color=yellow>" + F.config['server-info'].split('\\n').join("\n") + "</color>");
                        console.log("BOT (info): " + steamid  + " | " + user);

                    } else if((data = infoRE2.exec(text))) {
                        var subject = data[1];

                        if(subject == "users" || subject == "players") {
                            serverService.getServerInfo(function(serverInfo){
                                F.global.rcon.service.Command("say <color=yellow>Játékos információk:\n" +
                                    "Max: "         +serverInfo.MaxPlayers+ " hely\n"+
                                    "Játékban: "        +serverInfo.Players+ " fő\n"+
                                    "Várakozó: "        +serverInfo.Queued+ " fő\n"+
                                    "Belépés alatt: "    +serverInfo.Joining+ " fő"+
                                "</color>");
                            });

                        } else if(subject == "wipe" ) {
                            F.global.rcon.service.Command("say <color=yellow>" + F.config['wipe-info'].split('\\n').join("\n") + "</color>");

                        } else if(subject == "npcs" || subject == "npc") {
                            var npcInfo = npcService.getNPCInfo();

                            lastHeliTime        = "nincs információ";
                            lastAirdropTime     = "nincs információ";

                            if(npcInfo.lastAirdropTime != null) {
                                lastAirdropTime = npcInfo.lastAirdropTime.format('HH:MM:ss');
                            }

                            if(npcInfo.lastHeliTime != null) {
                                lastHeliTime = npcInfo.lastHeliTime.format('HH:MM:ss');
                            }

                            F.global.rcon.service.Command("say <color=yellow>NPC információk: \n" +
                                "Utolsó légi ellátmány időpontja: "+lastAirdropTime+"\n" +
                                "Utolsó helikopter időpontja: "+lastHeliTime+"\n" +
                                "Jelenlegi idő: " + (new Date().format('HH:MM:ss')) +
                                "</color>");

                        } else if(subject == "time") {
                            serverService.getServerInfo(function(serverInfo){
                                console.log(serverInfo);
                                var datetimeRE    = new RegExp(F.config['ingame-date-regex']);
                                if((timedata = datetimeRE.exec(serverInfo.GameTime))) {
                                    var gameTime = ("0"+timedata[2]).slice(-2) + ":" + ("0"+timedata[3]).slice(-2) + ":" + ("0"+timedata[4]).slice(-2);
                                    F.global.rcon.service.Command("say <color=yellow>Játék idő: "+gameTime+"</color>");
                                }
                            });
                        }
                        console.log("BOT (info): " + steamid  + " | " + user);

                    } else if((data = kickRE.exec(text))) {
                        var player = data[1];
                        if((F.isAdmin(steamid) || F.isModerator(steamid)) && player != user.toLowerCase()) {
                            F.global.rcon.service.Command('kick "' + player+'"');
                        } else {
                            console.log("BOT (kick): " + player  + " | no access");
                        }

                    } else if((data = banRE1.exec(text))) {
                        var player = data[1];
                        if(F.isAdmin(steamid) && player != user.toLowerCase()) {
                            F.global.rcon.service.Command('ban "' + player+'"');
                        } else {
                            console.log("BOT (ban): " + player  + " | no access");
                        }

                    } else if((data = muteRE1.exec(text))) {
                        var player = data[1];
                        if((F.isAdmin(steamid) || F.isModerator(steamid)) && player != user.toLowerCase()) {
                            F.global.rcon.service.Command('mutechat "' + player+'"', function(msg){
                                if(msg.toLowerCase() != "player not found") {
                                    F.global.rcon.service.Command("say <color=yellow>"+user+"</color> befogta <color=red>"+player+"</color> száját");
                                }
                            });
                        } else {
                            console.log("BOT (mute): " + player  + " | no access");
                        }


                    } else if((data = unmuteRE.exec(text))) {
                        var player = data[1];
                        if((F.isAdmin(steamid) || F.isModerator(steamid)) && player != user.toLowerCase()) {
                            F.global.rcon.service.Command('unmutechat "' + player+'"', function(msg){
                                if(msg.toLowerCase() != "player not found") {
                                    F.global.rcon.service.Command("say <color=green>"+player+" újra beszélhet</color>");
                                }
                            });
                        } else {
                            console.log("BOT (unmute): " + player  + " | no access");
                        }

                    } else if((data = addblRE.exec(text))) {
                        var player = data[1];

                        if((F.isAdmin(steamid) || F.isModerator(steamid)) && player != user.toLowerCase()) {
                            userService.getUsers(function (users) {
                                for (var i = 0; i < users.length; i++) {
                                    if (users[i].DisplayName.toLowerCase() == player) {
                                        if(blacklist.indexOf(users[i].SteamID) == -1) {
                                            blacklist.push(users[i].SteamID);

                                            nosql.insert({
                                                name: users[i].DisplayName,
                                                steamid: users[i].SteamID
                                            }).callback(function(err) {
                                                F.global.rcon.service.Command("say <color=red>" + player + " added to the black list!</color>");
                                            });
                                        }
                                    }
                                }
                            });
                        }

                    } else if((data = delblRE.exec(text))) {
                        var player = data[1];

                        if((F.isAdmin(steamid) || F.isModerator(steamid)) && player != user.toLowerCase()) {
                            userService.getUsers(function (users) {
                                for (var i = 0; i < users.length; i++) {
                                    if (users[i].DisplayName.toLowerCase() == player) {
                                        if(blacklist.indexOf(users[i].SteamID) > -1) {
                                            blacklist.splice(blacklist.indexOf(users[i].SteamID));

                                            nosql.remove().make(function(builder) {
                                                builder.where('steamid', users[i].SteamID);
                                                builder.callback(function(err, count) {
                                                    F.global.rcon.service.Command("say <color=red>" + player + " removed from the black list!</color>");
                                                });
                                            });
                                        }
                                    }
                                }
                            });
                        }

                    } else if((data = helpRE.exec(text))) {
                        F.global.rcon.service.Command("say <color=yellow>Használható parancsok: \n" +
                            ".info -  egyéb szerver info\n" +
                            ".info players - játékosok száma\n" +
                            ".info wipe - wipe info\n" +
                            ".info time - aktuális játék idő\n" +
                            ".info npc - npc info\n" +
                            "</color>");

                        console.log("BOT (help): " + steamid  + " | " + user);
                    }
                }
            }
        }

    });
};
