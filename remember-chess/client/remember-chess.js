rightInRow = 0;

Template.chessboard.onRendered(
    function() {
        Session.set('rightInRow', rightInRow);
        Session.set('value', 'start');
        var startFen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R';
        createBoard(startFen);
        Session.set('savedFen', startFen);
    }
);


Template.boardDropdown.events({
    "click #fourth": function(event) {
        event.preventDefault();
        Session.set('boardSize', 0.25);
        chessboard.position(getFen());
        //quarterFen(Session.get('savedFen'));
    },

    "click #half": function(event) {
        event.preventDefault();
        Session.set('boardSize', 0.5);
        chessboard.position(getFen());
        //halveFen(Session.get('savedFen'));
    },

    "click #full": function(event) {
        event.preventDefault();
        Session.set('boardSize', 1);
        console.log(Session.get('boardSize'));
        chessboard.position(getFen());
    }
});

Template.addFens.events({
    "submit .urlForm": function(event) {
        event.preventDefault();
        var url = event.target.text.value;
        Meteor.call('getFensFromUrl', url);
        event.target.text.value = "";
        console.log(Fens.find().fetch());
    }
});

//the chessboard sometimes skips a click
Template.chessButtons.events({
    "click #start": function() {
        if (Session.get('value') === 'ready') {
            //gets current piece positions
            var playerPosition = chessboard.fen();
            //TODO: make a text fadeaway thingy for success
            if(playerPosition == Session.get('savedFen')) {
                console.log('success');
                Session.set('rightInRow', rightInRow++);
            }
            else {
                console.log('wrong position');
                rightInRow = 0;
                Session.set('rightInRow', rightInRow);
            }

            chessboard.position(getFen());
            Session.set('value', 'start');
        }
        else if(Session.get('value') === 'start') {
            chessboard.position('8/8/8/8/8/8/8/8');
            Session.set('value', 'ready');
        }
    },

    "click #skip": function() {
        chessboard.position(getFen());
        Session.set('value', 'start');
    }
});

Template.chessButtons.helpers({
    startAndReadyText: function () {
        if(Session.get('value') === 'start') {
            return 'Start';
        }
        else if(Session.get('value') === 'ready') {
            return 'Ready';
        }
    }
});

Template.rightInRow.helpers({
    amt: function() {
        return Session.get('rightInRow');
    }
})

//the bug where the things don't show was because of the animation speed 0
function createBoard (fen) {
    chessboard = ChessBoard('board', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true,
        position: fen,
        moveSpeed: 2000
    });
    Session.set('chessboard', chessboard);
    return chessboard;
}

//TODO: if someone goes straight to the /train route, the get wont work
//TODO: rotate the split and quarter fens around the board
function getFen () {
    var randomIndex = getRandomInt(0, Fens.find().fetch().length - 1);
    //console.log(Fens.find().fetch());
    //console.log(Fens.findOne({index: randomIndex}));
    var fenFromIndex = Fens.findOne({index: randomIndex});
    //console.log(fenFromIndex.fen);
    var fen = fenFromIndex.fen;

    if(Session.get('boardSize') == 0.5) {
        fen = halveFen(fen);
    }
    else if (Session.get('boardSize') == 0.25) {
        fen = quarterFen(fen);
    }

    Session.set('savedFen', fen);
    return fen;
}

function halveFen (fen) {
    var splitFen = fen.split('/');
    var halvedFen = splitFen[0] + '/' + splitFen[1] + '/' + splitFen[2] +
                    '/' + splitFen[3] + '/8/8/8/8';
    return halvedFen;
}

function quarterFen (fen) {
    //console.log(fen);
    var splitFen = fen.split('/');
    //var isLetter = /[a-zA-Z]/g;
    var isNumber = /[0-9]/g;
    for(var i = 0; i < splitFen.length - 4; i++) {
        var position = 0;
        var n = 0;
        //TODO: add the number ones together in the end to make a better fen
        addition: while(true) {
            var thisChar = splitFen[i].charAt(0);
            if(thisChar.match(isNumber)) {
                var thisNum = parseInt(thisChar);
                n += thisNum;
                splitFen[i] = removeCharAt(splitFen[i], 0);
            }
            else {
                n++;
                splitFen[i] = removeCharAt(splitFen[i], 0);
            }
            if(n >= 4) {
                break addition;
            }
            position++;
        }

        //console.log(splitFen[i]);
        var secondChar = splitFen[i].charAt(0);
        if(secondChar.match(isNumber)) {
            var secondNumber = parseInt(secondChar);
            n = n + secondNumber;
            splitFen[i] = removeCharAt(splitFen[i], 0);
        }

        splitFen[i] = n + splitFen[i];
    }
    var quarterFen = splitFen[0] + '/' + splitFen[1] + '/' + splitFen[2] +
        '/' + splitFen[3] + '/8/8/8/8';

    return quarterFen;
}

function removeCharAt (str, position) {
    return str.substring(0, position) + str.substring(position+1, str.length);
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}