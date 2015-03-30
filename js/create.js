var os = require('os');

netInterfaces = os.networkInterfaces();
var ip = netInterfaces.wlan0[0].address;
console.log(ip);

var roomName;

$('#createGame').on('click',function( ev ){
    ev.preventDefault();
    var element = $('#roomName');

    if(element.val() === ''){

        $('#nameError').removeClass('hide');

    }else{
        roomName = element.val();
        global.infoGame.ip = ip;
        global.infoGame.roomName = roomName;

        console.log(roomName);
        console.log(global.infoGame);
        window.location.href = "../app/serverGame.html";

    }

});

$('#closeNameError').on('click',function(ev){
    ev.preventDefault();
    $(this).parent().addClass('hide');
    console.log('Error cerrado' );
});



