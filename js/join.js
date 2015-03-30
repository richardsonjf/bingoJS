var clientUDP = network.clientUDP(10022);
var template = _.template($('#room-template').html());
var rooms = [];

clientUDP.on('message',function(message,remote){
        console.log('message receive: ' + message + 'remote to: ' +remote.address);
        var packet =  JSON.parse(message);

        if(packet.COD == 105){
            data = {
                roomName : packet.SALA,
                ip : packet.IP
            };

            if(!_.contains(rooms,data.ip)){
                $('#rooms').append(template(data));
                rooms.push(data.ip);
                $.material.init();
            }

        }
});


//Events
$('.btn-primary').on('click',function(ev){
    ev.preventDefault();
    var address = $("input[name='rooms']").val();

    if(typeof(address) != 'undefined'){
        global.infoGame.hostAddress = address;
        window.location.href = '../app/clientGame.html';
    }else{
        console.log('No se ha seleccionado ninguna Sala');
    }


});

$('.col-md-12').mouseenter(function(){
    $('.special-button').addClass('move-button');
});

$('.col-md-12').mouseleave(function(){
    $('.special-button').removeClass('move-button');
});

