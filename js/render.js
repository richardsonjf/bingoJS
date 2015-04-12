var render = {

    Player : function (data){
        $('#players').append(templates.player(data));
    },

    PlayerCardQuantity : function (md5PlayerIP, cardQuantity){
        console.log('rendered md5: ' + md5PlayerIP + '  '+ cardQuantity);
        console.log($('#'+md5PlayerIP).text(cardQuantity));
    },

    NumberCalled : function (number){
        $('#numbersCalled').append('<span class="badge label-success"><span>'+ number +'</span></span>');
    },

    Hit : function (cardID, number){
        $('#' + cardID).find('#' + number).addClass('success');
    },

    Card : function (json){
        data= {
            cardID : json.IDCARTON,
            card : json.NUMEROS
        };
        $('#cards-container').prepend(templates.card(data));
    }

};