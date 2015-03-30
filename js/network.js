var dgram = require('dgram');
var network = {

    serverUDP : function(json,port){
        var dgram = require('dgram');
        var PORT = port;
        var HOST = '255.255.255.255';
        var server = dgram.createSocket('udp4');
        var message = new Buffer(JSON.stringify(json));
        server.bind(function(){
            server.setBroadcast(true);
        });

        server.send(message,0,message.length,PORT,HOST,function (err,byte) {
            if (err) throw err;
            console.log('Message UDP sended to: ' + HOST + ' Port: ' + PORT);
            server.close();
        });
    },

    clientUDP: function (port){
        var dgram = require('dgram');
        var client = dgram.createSocket('udp4');
        var PORT = port;
        var HOST = '255.255.255.255';
        client.on('listening',function(){
            console.log("Server on listening:"+ HOST + ' Port:' + PORT);
        });



        client.bind(PORT,HOST);
        return client;
    }


};