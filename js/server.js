var MD5 = require('MD5');
var bingoCard = require('../js/bingoCard.js');

var ip = global.infoGame.ip;
var port = global.infoGame.PORT;
var roomName = global.infoGame.roomName;
var gameID = global.infoGame.gameID = MD5(ip);
var users = [];
var bingoNumbers = [];
var intervalToAnnounce;
var intervalMulticast;
var sendMulticast;
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

    intervalToAnnounce = setInterval(function(){
                network.serverUDP(message,port);
    }, 5000);

     var data = {
        type: 'alert-success',
        message: 'El servidor se esta Anunciando.',
        description: 'En el puerto: ' + port
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

    server.listen(port,function(){
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
            ip : getIpFormat(sock.localAddress),
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

function callNumber(){

    intervalMulticast = setInterval(function(){


        data = {
            COD : 308,
            IDJUEGO : gameID,
            NROJUGADA : bingoNumbers.length + 1,
            NUMERO : generateUniqueNumber()

        };
        //Finalize Game
        if(bingoNumbers.length === 75)
            clearInterval(intervalMulticast);

        sendMulticast(data);
        renderNumberCalled(data.NUMERO);
    }, 1000);
}

function generateUniqueNumber(){
    var number;
    do{

        number = bingoCard.generateRandomInt(1,76);

    }while(_.contains(bingoNumbers,number));

    bingoNumbers.push(number);
    return number;
}

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
function renderNumberCalled(number){
    $('#numbersCalled').append('<span class="badge label-danger">'+ number +'</span>');
}



//Events
$('#startGame').on('click',function(ev){
    ev.preventDefault();
    console.log('Empezar juego');
    sendMulticast = network.multicast(5554);
    clearInterval(intervalToAnnounce);
    sendMulticast({COD:300, IDJUEGO:gameID});
    ev.currentTarget.remove();
    callNumber();


});

$('h1').text('Sala:' + roomName);
$('title').text('Partida Creada - Sala:' + roomName);

$('.close').on('click',function(){
    $(this).parent().remove();
});
