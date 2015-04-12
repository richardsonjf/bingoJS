var MD5 = require('MD5');
var bingoCard = require('../js/bingoCard.js');
var utilities = require('../js/bingoUtilities.js');

var ip = global.infoGame.ip;
var port = global.infoGame.PORT;
var time = global.infoGame.TIME;
var roomName = global.infoGame.roomName;
var gameID = global.infoGame.gameID = MD5(ip);
var users = [];
var bingoNumbers = [];
var intervalToAnnounce;
var intervalMulticast;
var sendMulticast;
var templates = {
    player : _.template($('#player-template').html())
};

users.push({
            playerName: 'Prueba',
            ip: 'fff:ff:192.154.2.1',
            sock: null,
            cards : []
        });
announceRoom(ip,roomName);

function announceRoom(ip , room){
    var message = {
        'COD': 105,
        'IP': ip,
        'SALA': room
    };

    intervalToAnnounce = setInterval(function(){
                network.serverUDP(message,port);
    }, 1000*time);

     var data = {
        type: 'alert-success',
        message: 'El servidor se esta Anunciando.',
        description: 'En el puerto: ' + port
    };

    //do toastr
    toastr["success"]("Se esta anunciando en el puerto: " + port,"El servidor esta Anunciando.");
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
            var user = _.find(users,function(users){
                        return typeof(users.sock.localAddress) === 'undefined';
                    });
            removePlayer(user);
            //check if an error occurs
            delete user.sock;
            var index = users.indexOf(user);
            users.splice(index, 1);

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
            case 303:
            case 304:
            case 305:
            case 306:
                announceBingo(data, sock);
                break;
            default:
                console.log('Codigo erroneo de JSON');
                break;
        }
    }

    function responseRequestCards(json, sock){
        var user = findUser(sock.remoteAddress);

        for (var i = 0; i < json.NROCARTONES; i++) {
            var card = bingoCard.generateBingoCard();
            data ={
                COD: 103,
                IDCARTON : card.cardID,
                NUMEROS : card.card
            };
            sleep(200);

            sock.write(JSON.stringify(data));
            user.cards.push(card);

        }

        console.log(user);

        renderPlayerCardQuantity(MD5(user.ip),json.NROCARTONES);
    }

    function responseConnection( json, sock ){

        data = {
            playerName : json.CLIENTE,
            ip : sock.remoteAddress,
            md5ip: MD5(sock.remoteAddress)
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
            ip: sock.remoteAddress,
            sock: sock,
            cards : []
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
    function announceBingo(data, sock){
        var message = {
            COD: 302,
            IDJUEGO : gameID
        };
        clearInterval(intervalMulticast);
        sendMulticast(message);
        var user = findUser(sock.remoteAddress);
        //do toastr
        toastr["info"]("El cliente que lo canto es:  " + user.playerName,"Se ha cantado BINGO");
        console.log(user);
        var userCards = user.cards;

        var card = _.findWhere(userCards,{cardID : data.IDCARTON});
        console.log(card);
        if(card){
            var key = 'COD';
            var checked = false;
            message ={
                COD : 307,
                IDJUEGO: gameID,
                CLIENTE : user.playerName,
                TIPOBINGO: ''
            };
            data.referenceMatrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]];
            for(var i = 0; i < bingoNumbers.length ; i++){
                    data.referenceMatrix = utilities.updateReferenceMatrix(data,bingoNumbers[i]);
            }


            if(data.COD === 303){
                delete data[key];
                checked = utilities.checkBingoVertical(data.referenceMatrix);
                if(checked)
                    message.TIPOBINGO = 'Bingo Vertical';

            }

            if(data.COD === 304){
                delete data[key];
                checked = utilities.checkBingoHorizontal(data.referenceMatrix);
                if(checked)
                    message.TIPOBINGO = 'Bingo Horizontal';

            }
            if(data.COD === 305){
                delete data[key];
                checked = utilities.checkBingoDiagonal(data.referenceMatrix);
                if(checked)
                    message.TIPOBINGO = 'Bingo Diagonal';

            }

            if (checked){
                toastr["success"]("Ha ganado:  " + message.IDCARTON + " con " + message.TIPOBINGO ,"Se ha aceptado el BINGO");
                sleep(1000);
                sendMulticast(message);

            }
        }

    }

}());

function findUser( ip ){
    var user = _.findWhere(users,{ip: ip});
    return user;
}

function callNumber(){
    toastr["info"]("","Ha comenzado el juego");
    intervalMulticast = setInterval(function(){


        data = {
            COD : 308,
            IDJUEGO : gameID,
            NROJUGADA : bingoNumbers.length + 1,
            NUMERO : generateUniqueNumber()

        };
        //Finalize Game
        if(bingoNumbers.length === 75){
            clearInterval(intervalMulticast);
            sendMulticast({COD: 301, IDJUEGO : gameID});
        }

        sendMulticast(data);
        renderNumberCalled(data.NUMERO);
    }, 1000*time);

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


function renderPlayer(data){
    $('#players').append(templates.player(data));
}

function renderPlayerCardQuantity(md5PlayerIP, cardQuantity){
    console.log('rendered md5: ' + md5PlayerIP + '  '+ cardQuantity);
    console.log($('#'+md5PlayerIP).text(cardQuantity));
}
function renderNumberCalled(number){
    $('#numbersCalled').append('<span class="badge label-primary"><span>'+ number +'</span></span>');
}

function removePlayer(data){
    $('#'+data.playerName+'-'+ MD5(data.ip)).remove();
}



//Events
$('#startGame').on('click',function(ev){
    ev.preventDefault();
    console.log('Empezar juego');
    sendMulticast = network.multicast(5554);
    clearInterval(intervalToAnnounce);
    sendMulticast({COD:300, IDJUEGO:gameID});
    ev.currentTarget.remove();
    sleep(100);
    callNumber();


});

$('h1').text('Sala:' + roomName);
$('title').text('Partida Creada - Sala:' + roomName);

$('.close').on('click',function(){
    $(this).parent().remove();
});
