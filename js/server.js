var MD5 = require('MD5');
var bingoCard = require('../js/bingoCard.js');

var ip = global.infoGame.ip;
var roomName = global.infoGame.roomName;
var gameID = global.infoGame.gameID = MD5(ip);
var users = new Array();

var templates = {
    infoMessage : _.template($('#info-template').html()),
    player : _.template($('#player-template').html())
};

announceRoom(ip,roomName);

function announceRoom(ip , room){
    var message = {
        'COD': 105,
        'IP': ip,
        'SALA': room
    };

    setInterval(function(){
                network.serverUDP(message,10022);
    }, 5000);

     var data = {
        type: 'alert-success',
        message: 'El servidor se esta Anunciando.',
        description: 'En el puerto: 10022'
    };
    renderInfoMessage(data);
}

(function startServer(){
    var server = network.net.createServer(function(client){

        console.log('client connected');

        client.on('data',function(data){
            console.log(data.toString());
            var message = parseJSON(data);
            handleData(message,client);
        });

        client.on('end',function(){
            console.log('client disconected');
        });

    });

    server.listen(10022,function(){
        console.log('Server listening');
    });

    function handleData( data , sock ) {

        switch(data.COD){
            case 100:
                responseConnection(data, sock);
                break;
            case 102:
                responseRequestCards(data,sock);
                break;
            default:
                console.log('Codigo erroneo de JSON');
                break;
        }
    }

    function responseRequestCards(json, sock){
        var user = _.find(users,function(){
                        return users.ip === json.localAddress;
                    });
        for (var i = 0; i < json.NROCARTONES; i++) {
            var card = bingoCard.generateBingoCard();
            data ={
                COD: 103,
                IDCARTON : card.cardID,
                NUMEROS : card.card
            };
            sleep(100);

            sock.write(JSON.stringify(data));
            user.cardsID.push(card.cardID);
        }

        console.log(user);
        renderPlayerCardQuantity(MD5(user.ip),json.NROCARTONES);
    }

    function responseConnection( json, sock ){

        data = {
            playerName : json.CLIENTE,
            ip : sock.localAddress,
            md5ip: MD5(sock.localAddress)
        };

        console.log(sock.remoteAddress);
        renderPlayer(data);

        var response ={
            COD : 101,
            IDJUEGO : gameID
        };

        sock.write(JSON.stringify(response));
        users.push({
            playerName: json.CLIENTE,
            ip: sock.localAddress,
            cardsID : []
        });

    }

    function parseJSON( json ){

        try{
            var data = JSON.parse( json );
            return data;
        }catch(err){
            console.log('Error al parsear el JSON  -' + err);
        }

    }

}());

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getIpFormat(ip){
    var parts = ip.split('f:');
    return parts[1];
}

function renderInfoMessage(data){
    $('#information').append(templates.infoMessage(data));
}

function renderPlayer(data){
    $('#players').append(templates.player(data));
}

function renderPlayerCardQuantity(md5PlayerIP, cardQuantity){
    console.log('rendered md5: ' + md5PlayerIP + '  '+ cardQuantity);
    console.log($('#'+md5PlayerIP).text(cardQuantity));
}



//Events

$('h1').text('Sala:' + roomName);
$('title').text('Partida Creada - Sala:' + roomName);

$('.close').on('click',function(){
    $(this).parent().remove();
});
