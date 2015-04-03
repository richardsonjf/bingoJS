var os = require('os');

netInterfaces = os.networkInterfaces();
var ip = netInterfaces.wlan0[0].address;
console.log(ip);
global.infoGame.ip = ip;
var client = network.clientTCP(10022,global.infoGame.hostAddress);
requestConnection();

client.on('data',function(data){
    console.log(data.toString());
});
function requestConnection(){
    data = {
        COD : 100,
        CLIENTE : global.infoGame.userName
    };

    client.write(JSON.stringify(data));
    console.log(data);
}