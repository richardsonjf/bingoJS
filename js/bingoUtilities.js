module.exports = {
    checkHit : function (card , number){

        for (var i = 0; i < 5 ; i++) {
            for (var j = 0; j < 5 ; j++) {
                if(card.NUMEROS[i][j] === number){
                    return card.IDCARTON;
                }

            }
        }

        return '';
    },

    updateReferenceMatrix: function (card, number){

        for (var i = 0; i < 5 ; i++) {
            for (var j = 0; j < 5 ; j++) {
                if(card.NUMEROS[i][j] === number){
                    card.referenceMatrix[i][j] = 1;
                    return card.referenceMatrix;
                }

            }
        }

        return card.referenceMatrix;
    },
    checkBingoDiagonal : function(referenceMatrix){
        var count = referenceMatrix[0][0] +
                    referenceMatrix[1][1] +
                    referenceMatrix[2][2] +
                    referenceMatrix[3][3] +
                    referenceMatrix[4][4] ;
        if(count === 5 )
            return {posX :[0,1,2,3,4] , posY: [0,1,2,3,4]};

        count = referenceMatrix[0][4] +
                referenceMatrix[1][3] +
                referenceMatrix[2][2] +
                referenceMatrix[3][1] +
                referenceMatrix[4][0] ;

        if (count === 5)
            return {posX: [0,1,2,3,4] , posY: [4,3,2,1,0] };


        return false;

    },
    checkBingoVertical : function (referenceMatrix){
        var count = 0;
        var positionX = [];
        var positionY = [];
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                count += referenceMatrix[i][j];
                positionX.push(i);
                positionY.push(j);
            }
            //console.log('la cuenta es : ' + count);
            if(count === 5)
                return {posX : positionX, posY : positionY};
            else{
                count = 0;
                positionY.splice(0,positionY.length);
                positionX.splice(0,positionX.length);
            }
        }
        return false;
    },
     checkBingoHorizontal : function (referenceMatrix){
        var count = 0;
        var positionX = [];
        var positionY = [];
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                count += referenceMatrix[j][i];
                positionX.push(j);
                positionY.push(i);
            }
            //console.log('la cuenta es : ' + count);
            if(count === 5)
                return {posX : positionX, posY : positionY};
            else{
                count = 0;
                positionY.splice(0,positionY.length);
                positionX.splice(0,positionX.length);
            }
        }
        return false;
    },
    checkBingoFull : function(referenceMatrix){
        var count = 0;
        for(var i = 0; i < 5 ;i++ ){
            for(var j = 0; j < 5 ;j++){
                count += referenceMatrix[i][j];
            }
        }
        if(count == 25)
            return true;

        return false;
    }
};