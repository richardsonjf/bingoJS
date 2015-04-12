var utilities = require('../js/bingoUtilities.js');

var ip = network.getMyIp();
var port = global.infoGame.PORT;
var client = network.clientTCP(port,global.infoGame.hostAddress);
var myCards = [];
var templates = {
    card : _.template($('#card-template').html())
};


requestConnection();

client.on('data',function(data){
    console.log(data.toString());
    var message = parseJSON(data);
    handleData(message);
});

function requestConnection(){
    data = {
        COD : 100,
        CLIENTE : global.infoGame.userName,
        IP: ip
    };

    client.write(JSON.stringify(data));
    console.log(data);
}

function handleData(data){
    switch(data.COD){
        case 101:
            handleGameID(data);
            break;
        case 103:
            console.log(data.NUMEROS);
            handleCards(data);
            break;
        case 300:
            toastr["success"]("","Ha comenzado el juego");
            break;
        case 301:
            toastr["info"]("","Ha finalizado el juego");
            break;
        case 308:
            handleNumbers(data);
            break;
        case 302:
            toastr["info"]("","Un cliente ha cantado bingo");
            break;
        case 307:
            toastr["info"]("Ganador : " +data.CLIENTE+ " con un " + data.TIPOBINGO,"El Servidor Acepto el BINGO");
            break;
    }
}
function handleCards(json){
    var key = 'COD';
    delete data[key];
    data.referenceMatrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    myCards.push(data);
    console.log(data);
    render.Card(json);

}

function handleGameID(data){
    global.infoGame.gameID = data.IDJUEGO;
    console.log('Se ha unido al juego con id: ' + data.IDJUEGO);
    hearmulticast(5554);
}

function handleNumbers(data){
    var number = data.NUMERO;
    $('#numbers').append('<span class="badge label-success"><span>'+ number +'</span></span>');
    renderHitForAllCards(number);
}

function parseJSON( json ){

    try{
        data = JSON.parse( json );
        return data;
    }catch(err){
        console.log('Error al parsear el JSON  -' + err);
    }

}

function hearmulticast(multicastPort){
    var dgram = require('dgram');
    var socket = dgram.createSocket('udp4');
    var PORT = multicastPort;
    socket.bind(PORT,'0.0.0.0',function(){
        socket.setBroadcast(true);
        socket.setTTL(1);
        socket.addMembership('239.1.2.3',ip);
    });

    socket.on('message',function(message,rinfo){

       var data = parseJSON(message);
       console.log(data);
       handleData(data);

    });
}

function callBingo(cod ,card, hits){
    var data = {
        COD : cod,
        IDCARTON : card.IDCARTON,
        NUMEROS : card.NUMEROS,
        ACIERTOS : hits
    };
    toastr["success"]("Felicidades has logrado un bingo","Has Hecho BINGO");
    client.write(JSON.stringify(data));
}

function checkAllTypesOfWinning(card){
    var typeOfWin;
    var hits;
    typeOfWin = utilities.checkBingoVertical(card.referenceMatrix);
    if(typeOfWin){
        hits = utilities.getHits(card,typeOfWin);
        callBingo(303,card,hits);
        return;
    }

    typeOfWin = utilities.checkBingoHorizontal(card.referenceMatrix);
    if(typeOfWin){
        hits = utilities.getHits(card,typeOfWin);
        callBingo(304,card,hits);
        return;
    }

    typeOfWin = utilities.checkBingoDiagonal(card.referenceMatrix);
    if(typeOfWin){
        hits = utilities.getHits(card,typeOfWin);
        callBingo(305,card,hits);
        return;
    }

    //missing bingo full
}


function renderHitForAllCards(number){

    for(var i = 0 ; i < myCards.length ; i++ ){
        var cardID = utilities.checkHit(myCards[i],number);
        if (cardID !== ''){
            myCards[i].referenceMatrix = utilities.updateReferenceMatrix(myCards[i],number);
            //Check all type of wins
            checkAllTypesOfWinning(myCards[i]);

        }
        render.Hit(cardID,number);
    }

}

//Events

$('#requestCards').on('click',function(e){
    e.preventDefault();

    var grandpa = $(this).parent().parent();
    var total = parseInt($('#totalCards option:selected').text(), 10);

    var message = {
        COD : 102,
        NROCARTONES : total
    };

    client.write(JSON.stringify(message));
    grandpa.css('display','none');
});

$(document).on('ready',function(){
    $('title').text('Bingo - Sala : '+ global.infoGame.roomName);
    $('h1').text('Bingo - Sala : '+ global.infoGame.roomName);
});

