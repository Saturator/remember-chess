Template.chessboard.onRendered(
    function() {
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
        //quarterFen(Session.get('savedFen'));
    },

    "click #half": function(event) {
        event.preventDefault();
        Session.set('boardSize', 0.5);
        //halveFen(Session.get('savedFen'));
    },

    "click #full": function(event) {
        event.preventDefault();
        Session.set('boardSize', 1);
        console.log(Session.get('boardSize'));
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

            if(playerPosition == Session.get('savedFen')) {
                console.log('success');
            }
            else {
                console.log('wrong position');
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
        //this quarter fen returns in the wrong format
        //so it doesn't match
        //TODO: make this so it matches
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
    var splitFen = fen.split('/');
    var isLetter = /[a-zA-Z]/g;
    var isNumber = /[0-9]/g;
    rows: for(var i = 0; i <= splitFen.length - 4; i++) {
        var capNumber = 0;
        //TODO: add the number ones together in the end to make a better fen
        chars: for (var n = 0; n <= splitFen[i].length - 4; n++) {
            var thisChar = splitFen[i].charAt(n);
            //console.log(thisChar);
            if(thisChar.match(isNumber)) {
                capNumber += parseInt(thisChar);
                if(capNumber >= 4) {
                    break chars;
                }
            }
            else if(thisChar.match(isLetter)) {
                splitFen[i] = insertNumberOne(splitFen[i], n);
            }
        }
        //console.log(splitFen[i]);
    }
    var quarterFen = splitFen[0] + '/' + splitFen[1] + '/' + splitFen[2] +
        '/' + splitFen[3] + '/8/8/8/8';
    //console.log("quarter: " + quarterFen);

    return quarterFen;
}

function insertNumberOne (str, position) {
    return str.substring(0, position) + '1' + str.substring(position+1, str.length);
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}