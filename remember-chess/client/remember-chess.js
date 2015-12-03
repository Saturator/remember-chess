Template.chessboard.onRendered(
    function() {
        Session.set('value', 1)
        var startFen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R';
        createBoard(startFen);
        Session.set('savedFen', startFen);
    }
);

Template.boardDropdown.events({
    "click #fourth": function(event) {
        event.preventDefault();
        Session.set('boardSize', 0.25);
    },

    "click #half": function(event) {
        event.preventDefault();
        Session.set('boardSize', 0.5);
        halveFen(Session.get('savedFen'));
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

Template.chessButtons.events({
    "click #start": function() {
        if(Session.get('value') == 1) {
            createBoard('8/8/8/8/8/8/8/8');
            Session.set('value', 2);
        }
        else {
            createBoard(getFen());
            Session.set('value', 1);
        }
    },

    "click #skip": function() {
        createBoard(getFen());
        Session.set('value', 1);
    }
});

Template.chessButtons.helpers({
    startAndReadyText: function test (value) {
        if(Session.get('value') == 1) {
            return 'Start';
        }
        else if(Session.get('value') == 2) {
            return 'Ready';
        }
    }
});


function createBoard (fen) {
    var chessboard = ChessBoard('board', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true,
        position: fen
    });
    return chessboard;
}

//TODO: if someone goes straight to the /train route, the get wont work
function getFen () {
    var randomIndex = getRandomInt(0, Fens.find().fetch().length);
    //console.log(Fens.find().fetch());
    console.log(Fens.findOne({index: randomIndex}));
    var fenFromIndex = Fens.findOne({index: randomIndex});
    console.log(fenFromIndex.fen);
    var fen = fenFromIndex.fen;

    if(Session.get('boardSize', 0.5)) {
        fen = halveFen(fen);
    }

    Session.set('savedFen', fen);
    return fen;
}

function halveFen (fen) {
    var splitFen = fen.split('/');
    console.log(splitFen);
    var halvedFen = splitFen[0] + '/' + splitFen[1] + '/' + splitFen[2] +
                    '/' + splitFen[3] + '/8/8/8/8'
    return halvedFen;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}