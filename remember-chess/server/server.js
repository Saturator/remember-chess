Meteor.publish('fens', function() {
    return Fens.find({});
});

Meteor.methods({
    'getFensFromUrl': function(url) {
        HTTP.get(url, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                var fenArray = result.content.split('\n');
                console.log(fenArray);
                //TODO: get the amount of indexes already in collection

                for(var i = 0; i < fenArray.length; i++) {
                    var insertableFen = fenArray[i].split(' ');
                    Fens.insert({index: i, fen: insertableFen[0]});
                }

                console.log("fen insert success")
            }
        })
    }
});