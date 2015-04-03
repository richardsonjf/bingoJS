var clientUDP = network.clientUDP(10022);
var template = _.template($('#room-template').html());
var rooms = [];

//need implement the client ip (userip)

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
    var element = $("input[name='rooms']:checked");
    var address = element.val();

    if(typeof(address) != 'undefined'){
        global.infoGame.hostAddress = address;
        global.infoGame.userName = $('#userName').val();
        global.infoGame.roomName = element.attr('data-roomName');
        clientUDP.close();
        window.location.href = '../app/clientGame.html';
    }else{
        console.log('No se ha seleccionado ninguna Sala');
    }


});

$('#userName').change(function(){
    $('.special-button').addClass('move-button');
});



