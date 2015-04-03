
var network = {
    net : require('net'),
    dgram: require('dgram'),
    serverUDP : function(json,port){
        var dgram = this.dgram;
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
        var dgram = this.dgram;
        var client = dgram.createSocket('udp4');
        var PORT = port;
        var HOST = '255.255.255.255';
        client.on('listening',function(){
            console.log("Server on listening:"+ HOST + ' Port:' + PORT);
        });



        client.bind(PORT,HOST);
        return client;
    },

    serverTCP : function (port){
        var net = this.net;
        var server = net.createServer(function( client ){
            console.log('client connected');
            client.on('end',function(){
                console.log('client disconnected');
            });
        });
        return server;
    },

    clientTCP : function(port,host){
        var net = this.net;
        var client = new net.Socket();

        client.connect(port,host,function(){
            console.log('connected to: ' + host + ' ' + port);
        });
    }


};