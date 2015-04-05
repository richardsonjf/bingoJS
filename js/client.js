var os = require('os');
var bingo = require('../js/bingoCard.js');
var netInterfaces = os.networkInterfaces();
var ip = netInterfaces.wlan0[0].address;
var client = network.clientTCP(10022,global.infoGame.hostAddress);
var myCards = [];
var card = bingo.generateBingoCard();
var templates = {
    card : _.template($('#card-template').html())
};

global.infoGame.ip = ip;

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
        default:
            console.log('switch:' +data);
            break;
    }
}
function handleCards(json){
    var key = 'COD';
    delete data[key];
    myCards.push(data);
    renderCard(json.NUMEROS);

}

function handleGameID(data){
    global.infoGame.gameID = data.IDJUEGO;
    console.log('Se ha unido al juego con id: ' + data.IDJUEGO);
}

function parseJSON(json){
    try{
        data = JSON.parse(json);
        return data;
    }catch(e){
        console.log(e);
    }
}

function renderCard(card){
    data= {
        card : card
    };
    $('#cards-container').prepend(templates.card(data));
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

