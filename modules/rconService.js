/**
 * Created by Gyurasits Zoltán on 2016.08.17..
 */

exports.install = function() {
    console.log('Install RCON service');
    F.global.rcon = new Rcon();
};


function Rcon() {
    var self = this;

    rconData = {};
    rconData.addr       = F.config['rcon-host'];
    rconData.port       = F.config['rcon-port'];
    rconData.pass       = F.config['rcon-pass'];
    rconData.noRetry    = F.config['rcon-noretry'];

    this.service = new RconService(rconData);
    this.service.defaultListener = function(msg) {
        F.emit('rconmessage', msg);
    };

    this.service.Connect();

}


function RconService(rconData) {

    var me = this;
    var WebSocket = require('ws');

    var States = {
        eCLOSED:0,
        eOPENED:1,
        eCONNECTING:2
    };

    this.rconData = rconData;

    this.state = States.eCLOSED;
    this.identifier = 1;
    this.listeners = {};
    this.commandQueue = [];

    this.isConnected = function() {
        return this.state == States.eOPENED;
    }

    this.Connect = function() {
        if(this.state != States.eCLOSED)
            return;

        console.log("Connecting");

        this.state = States.eCONNECTING;

        this.ws = new WebSocket( "ws://" + this.rconData.addr + ":" + this.rconData.port + "/" + this.rconData.pass );

        this.ws.on('open', function () {
            console.log("Connected");

            me.state = States.eOPENED;
            while(command = me.commandQueue.shift()) {
                me.Command(command.msg, command.callBack)
            }
        });

        this.ws.on('close', function () {
            if(me.rconData.noRetry) {
                console.log("Disconnected");

                process.exit(1);
            } else {
                console.log("Disconnected, retrying in 2s");

                me.state = States.eCLOSED;
                setTimeout(function() { me.Connect() }, 2000);
            }
        });

        this.ws.on('message', function (data, flags) {
            //console.log(data);
            me.OnMessage( JSON.parse( data ) );
        });

        this.ws.on('error', function (err) {
            if(me.rconData.noRetry) {
                console.log(err);
                process.exit(1);
            } else {
                console.log(err+" retrying in 10s");
                me.state = States.eCLOSED;
                setTimeout(function() { me.Connect() }, 10000);
            }
        });
    };

    this.Command = function(msg, callBack) {

        if(this.state == States.eCLOSED)
            this.Connect();

        if(this.state == States.eOPENED) {
            var packet = {
                Identifier: this.identifier,
                Message: msg,
                Type: "3"
            };

            if(callBack != null)
                this.listeners[this.identifier] = callBack

            this.identifier += 1;
            if(this.identifier >= 256)
                this.identifier = 1;

            this.ws.send( JSON.stringify( packet ) );
        } else {
            this.commandQueue.push({msg:msg, callBack:callBack});
        }
    };

    this.OnMessage = function(data) {
        if(data.Identifier in me.listeners && me.listeners[data.Identifier] != null) {
            me.listeners[data.Identifier](data.Message);
            me.listeners[data.Identifier] = null;
        } else if(this.defaultListener != null) {
            this.defaultListener(data.Message);
        }
    };

};


