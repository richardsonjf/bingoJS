$(document).on('ready',function(){

var ip = global.infoGame.ip;
var roomName = global.infoGame.roomName;

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
    var server = network.serverTCP(10022);
    console.log(server);
    server.listen(10022,function(){
        console.log('Server listening');
    });

}());

function renderInfoMessage(data){
    $('#information').append(templates.infoMessage(data));
}



//Events

$('h1').text('Sala:' + roomName);
$('title').text('Partida Creada - Sala:' + roomName);

$('.close').on('click',function(){
    $(this).parent().remove();
});

});