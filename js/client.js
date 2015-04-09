var os = require('os');
var utilities = require('../js/bingoUtilities.js');

var netInterfaces = os.networkInterfaces();
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
        CLIENTE : global.infoGame.userName
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
        case 308:
            handleNumbers(data);
            break;
        default:
            console.log('switch:' +data);
            break;
    }
}
function handleCards(json){
    var key = 'COD';
    delete data[key];
    data.referenceMatrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    myCards.push(data);
    console.log(data);
    renderCard(json);

}

function handleGameID(data){
    global.infoGame.gameID = data.IDJUEGO;
    console.log('Se ha unido al juego con id: ' + data.IDJUEGO);
    hearmulticast(5554);
}

function handleNumbers(data){
    $('#numbers').append('<span class="badge btn-success">'+ data.NUMERO +'</span>');
    renderHitForAllCards(data.NUMERO);
}

function parseJSON(json){
    try{
        data = JSON.parse(json);
        return data;
    }catch(e){
        console.log(e);
    }
}

function hearmulticast(multicastPort){
    var dgram = require('dgram');
    var socket = dgram.createSocket('udp4');
    var PORT = multicastPort;
    socket.bind(PORT,'0.0.0.0',function(){
        socket.setBroadcast(true);
        socket.setTTL(1);
        socket.addMembership('239.1.2.3');
    });

    socket.on('message',function(data,rinfo){

       //console.log(data.toString());
       var message = parseJSON(data);
       handleData(message);
    });
}
function checkAllTypesOfWinning( card, refrence ){
    var typeOfWin;

    typeOfWin = utilities.checkBingoVertical(myCards[i].referenceMatrix);
    //Vertical
    if(typeOfWin){

    }else{

        typeOfWin = utilities.checkBingoHorizontal(myCards[i].referenceMatrix);
        //Horizontal
        if(typeOfWin){

        }else{
            typeOfWin = utilities.checkBingoDiagonal(myCards[i].referenceMatrix);
            //Diagonal
            if(typeOfWin){

            }else{

                typeOfWin = utilities.checkBingoFull(myCards[i].referenceMatrix);
                //Full
                if (typeOfWin){

                }else{

                }

            }
        }
    }



}

function renderCard(json){
    data= {
        cardID : json.IDCARTON,
        card : json.NUMEROS
    };
    $('#cards-container').prepend(templates.card(data));
}

function renderHitForAllCards(number){

    for(var i = 0 ; i < myCards.length ; i++ ){
        var cardID = utilities.checkHit(myCards[i],number);
        if (cardID !== ''){
            myCards[i].referenceMatrix = utilities.updateReferenceMatrix(myCards[i],number);

            //Check all type of wins
            //console.log(utilities.checkBingoVertical(myCards[i].referenceMatrix));
            //console.log(utilities.checkBingoHorizontal(myCards[i].referenceMatrix));
            //console.log(utilities.checkBingoDiagonal(myCards[i].referenceMatrix));
            //console.log(utilities.checkBingoFull(myCards[i].referenceMatrix));
        }
        console.log(cardID);
        renderHit(cardID,number);
    }

}

function renderHit(cardID, number){
    $('#' + cardID).find('#' + number).addClass('success');
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
