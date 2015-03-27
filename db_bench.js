var fs = require('fs');
var split = require('split');
var mongojs = require('mongojs');

var consts = require('./consts');

var db = mongojs( 'leaderboard', ['ranking']);

var saving_time = 0.0;
var single_save_timer;

var number_of_scores = 0;
var db_request = 0;
var save_time = 0;

function dump_statistics() {
    console.log( "number of users:", number_of_scores);
    console.log( "saving time: %d ns", save_time);
}

db.ranking.drop( function() {
    fs.createReadStream(consts.ranking_filename)
        .pipe(split())
        .on('data', function (line) {
            if ( line.length === 0 )
                return;

            var fields = line.split('|');
            
            var timer = process.hrtime();

            db.ranking.save( { user: fields[1], score: fields[2] }, function(err, doc) {
                var elapsed = process.hrtime(timer);

                number_of_scores++;

                save_time += elapsed[0] * 1e9 + elapsed[1];

                // No more request pending
                if ( number_of_scores === consts.scores_count ) {
                    dump_statistics();
                    process.exit(0);
                }

            });
        });

});
