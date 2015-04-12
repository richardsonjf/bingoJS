var clientUDP = network.clientUDP(global.infoGame.PORT);
var template = _.template($('#room-template').html());
var rooms = [];

clientUDP.on('message',function(message,remote){
        console.log('message receive: ' + message + 'remote to: ' +remote.address);
        var packet;

        try{
             packet =  JSON.parse(message);
        }catch(er){
            console.log(er);
        }

        if(packet.COD == 105){
            data = {
                roomName : packet.SALA,
                ip : remote.address
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
    var userName = $('#userName').val();
    console.log(ev);
    if(typeof(address) != 'undefined' && userName !== ''){
        global.infoGame.hostAddress = address;
        global.infoGame.userName = userName;
        global.infoGame.roomName = element.attr('data-roomName');
        clientUDP.close();
        window.location.href = '../app/clientGame.html';
    }else{
        if( userName === '')
            toastr["error"]("El campo nombre de usuario esta vacio","Nombre Invalido");
        else
            toastr["error"]("No se ha selecionado ninguna sala a la cual unirse","Error de Sala");
    }


});

$('#userName').change(function(ev){
    $('.special-button').addClass('move-button');
});



