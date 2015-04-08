var _ = require('underscore');
var MD5 = require('MD5');
module.exports = {
    generateBingoCard : function(){

        card = [];

        card.push(this.generateBingoLetter('B'));
        card.push(this.generateBingoLetter('I'));
        card.push(this.generateBingoLetter('N'));
        card.push(this.generateBingoLetter('G'));
        card.push(this.generateBingoLetter('O'));


        return {
            cardID : MD5(card.toString()),
            card : card
        };
    },

    generateBingoLetter :function(letter){
        var max,min;
        var number;
        var row = [];

        switch(letter){
            case 'B':
                min = 1;
                max = 15;
                break;
            case 'I':
                min = 16;
                max = 30;
                break;
            case 'N':
                min = 31;
                max = 45;
                break;
            case 'G':
                min = 46;
                max = 60;
                break;
            case 'O':
                min = 61;
                max = 76;
                break;
        }


        while(row.length < 5){
            number = this.generateRandomInt(min,max);
            if(!_.contains(row,number)){
                row.push(number);
            }

        }

        if(letter === 'N')
            row[2] = 0;

        return row;
    },

    generateRandomInt: function (min , max) {
          return Math.floor(Math.random() * (max - min) ) + min;
    }
};