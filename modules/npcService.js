/**
 * Created by Gyurasits Zoltán on 2016.08.18..
 */

exports.dependencies = ['rconService'];

var lastAirdropTime = null;
var lastHeliTime = null;

exports.install = function() {
    console.log('Install NPC service');

    var nosql = NOSQL('npcevents');

    F.on('rconmessage', function(msg) {

        var npcRE       = new RegExp(/^\[event\] .+\/(.+)\.prefab/);

        if((data = npcRE.exec(msg))) {

            var enitity = data[1];

            if (enitity == "cargo_plane") {
                F.global.rcon.service.Command("say <color=yellow>Légi ellátmány érkezik!</color>");
                lastAirdropTime = new Date();

                nosql.find().make(function(builder) {
                    builder.where('npc', "cargo_plane");
                    builder.callback(function(err, response) {
                        if(response.length == 0) {
                            nosql.insert({
                                npc: "cargo_plane",
                                t: lastAirdropTime
                            }).callback(function(err) {});
                        } else {
                            nosql.modify({
                                t: lastAirdropTime
                            }).make(function(builder) {
                                builder.where('npc', "cargo_plane");
                                builder.callback(function(err, count) {});
                            });
                        }
                    });
                });
            }

            else if (enitity == "patrolhelicopter") {
                lastHeliTime = new Date();

                nosql.find().make(function(builder) {
                    builder.where('npc', "patrolhelicopter");
                    builder.callback(function(err, response) {
                        if(response.length == 0) {
                            nosql.insert({
                                npc: "patrolhelicopter",
                                t: lastHeliTime
                            }).callback(function(err) {});
                        } else {
                            nosql.modify({
                                t: lastHeliTime
                            }).make(function(builder) {
                                builder.where('npc', "patrolhelicopter");
                                builder.callback(function(err, count) {});
                            });
                        }
                    });
                });
            }

        }

    });


    nosql.find().make(function(builder) {
        builder.callback(function(err, response) {
            for(var i = 0; i < response.length;i++){
                if(response[i].npc == "cargo_plane") {
                    lastAirdropTime = new Date(response[i].t);
                }
                if(response[i].npc == "patrolhelicopter") {
                    lastHeliTime = new Date(response[i].t);
                }
            }
        });
    });
};


exports.getNPCInfo = function() {
    return {
        lastAirdropTime : lastAirdropTime,
        lastHeliTime    : lastHeliTime
    }
}

