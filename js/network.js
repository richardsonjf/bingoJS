
var network = {
    net : require('net'),
    dgram: require('dgram'),
    os: require('os'),
    getMyIp : function(){
        var netInterfaces = this.os.networkInterfaces();
        var ip;

        if(typeof(netInterfaces.wlan0)  === 'undefined')
            ip = netInterfaces.eth0[0].address;
        else
            ip = netInterfaces.wlan0[0].address;

        return ip;
    },
    serverUDP : function(json,port){
        var dgram = this.dgram;
        var PORT = port;
        var HOST = '255.255.255.255';
        var server = dgram.createSocket('udp4');
        var message = new Buffer(JSON.stringify(json));
        server.bind(function(){
            server.setBroadcast(true);
        });

        server.send(message,0,message.length,PORT,HOST,function (err) {
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

    clientTCP : function(port,host){
        var net = this.net;
        var client = new net.Socket();

        client.connect(port,host,function(){
            console.log('connected to: ' + host + ' ' + port);
        });
        return client;
    },
    multicast : function(multicastPort){
        var dgram = this.dgram;
        var PORT = multicastPort;
        var multicastAddress = '239.1.2.3';
        var server = dgram.createSocket('udp4');

        //The port bind should be changed
        server.bind(5555,'0.0.0.0',function(){
            server.setBroadcast(true);
            server.setMulticastTTL(128);
            server.addMembership(multicastAddress);
        });

        var send = function(message){
            var data = new Buffer(JSON.stringify(message));
            server.send(data,0,data.length,PORT,multicastAddress,function(err){
                if (err) throw err;
                console.log('multicast sended : '+ JSON.stringify(message));
            });

        };

        return send;
    }


};