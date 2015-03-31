var async = require('async');
var fs = require('fs');
var split = require('split');
var mongojs = require('mongojs');

var bench_utils = require('./bench_utils');
var consts = require('./consts');
var bench_info = require('./bench_info');

var db = mongojs( 'leaderboard', ['ranking']);

var statistics = bench_info.mongodb;


function drop_ranking_collection(next) {
    db.ranking.drop( function() {
        console.log( '- collection droped');
        next(null);
    } );
};

function count_scores_entries(next) {
    console.log('- counting lines of %s...', consts.ranking_filename)
    fs.createReadStream(consts.ranking_filename)
        .pipe(split())
        .on('data', function(line) {
            // End of file
            if ( line.length === 0 ) {
                next(null);
                return;
            }


            statistics.score_entries.count++;

        })
};

function save_entries(next) {
    console.log( '- invoking db.ranking.save for %d records...', statistics.score_entries.count);
    statistics.save_time.counter = statistics.score_entries.count;
    fs.createReadStream(consts.ranking_filename)
        .pipe(split())
        .on('data', function(line) {
            // End of file
            if ( line.length === 0 )
                return;

            var fields = line.split('|');
            
            var timer = process.hrtime();
            db.ranking.save( { user: fields[1], score: Number(fields[2]) }, function(err, doc) {
                var elapsed = process.hrtime(timer);
                statistics.save_time.time += elapsed[0] * 1e9 + elapsed[1];

                statistics.save_time.counter--;

                // end of entries
                if ( statistics.save_time.counter === 0)
                    next(null);
            
            });
        });
}

function build_index_on_ranking(next) {
    console.log('- creating index for ranking on score...');
    db.ranking.createIndex( {score: 1 }, function() {
        next(null);
    });

};

function retrieve_user_score(next) {
    statistics.retrieve_user_score.user =
        bench_utils.params( statistics.retrieve_user_score.user, process.argv[2]);
    console.log('- retrieving %s score...', statistics.retrieve_user_score.user);

    var timer = process.hrtime();
    db.ranking.find(
        { user: statistics.retrieve_user_score.user },  /* query */
        { score: 1},                                    /* projection */
        function(err, docs) {
            var elapsed = process.hrtime(timer);
            statistics.retrieve_user_score.time += elapsed[0] * 1e9 + elapsed[1];
            statistics.retrieve_user_score.score = docs[0].score;

            next(null);
        });
        
}

function alter_user_score(next) {
    statistics.alter_user_score.user =
        bench_utils.params(statistics.alter_user_score.user, process.argv[2]);

    statistics.alter_user_score.new_score_value =
        bench_utils.params( statistics.alter_user_score.new_score_value, process.argv[3] );
                
    console.log( '- altering %s score...', statistics.alter_user_score.user);

    var timer = process.hrtime();
    db.ranking.update(
        { user: statistics.alter_user_score.user },  /* query */
        { $set:
          { score: Number(statistics.alter_user_score.new_score_value)}
        },
        function(err, docs) {
            var elapsed = process.hrtime(timer);
            statistics.alter_user_score.time += elapsed[0] * 1e9 + elapsed[1];
            
            next(null);
        });
}

function retrieve_top_n(next) {

    console.log("- retrieving first %d users...", Number(statistics.top_n.n));
    
    var timer = process.hrtime();
    db.ranking
        .find( {}, { user: 1, score: 1, _id: 0})
        .sort( { score: -1 })
        .limit( Number(statistics.top_n.n), function(err, docs) {
            var elapsed = process.hrtime(timer);
            statistics.top_n.time += elapsed[0] * 1e9 + elapsed[1];

            console.log(docs);
            next(null);
        });

}

function retrieve_ranking(next) {
    statistics.ranking.user =
        bench_utils.params(statistics.ranking.user, process.argv[2]);

    var timer = process.hrtime();
    var ranking = 0;
    
    var timer = process.hrtime();
    db.ranking.findOne( {user: statistics.ranking.user}, {_id:1}, function(err, foundEntry) {
        db.ranking
            .find({}, { _id: 1})
            .sort({ score: -1 })
            .forEach( function(err,entry) {
                if ( entry === null)
                    return;

                if ( entry._id.equals(foundEntry._id)) {
                    var elapsed = process.hrtime(timer);
                    statistics.ranking.rank = ranking;
                    statistics.ranking.time += elapsed[0] * 1e9 + elapsed[1];
                    console.log("ranking for user %s: %d", statistics.ranking.user, statistics.ranking.rank);
                    next(null);
                }


                ranking++;
            });
    });
}

bench_utils.track_memory_usage(statistics.memory_usage);

async.series( [
    drop_ranking_collection,
    count_scores_entries,
    save_entries,
    build_index_on_ranking,
    retrieve_user_score,
    alter_user_score,
    retrieve_top_n,
    retrieve_ranking
], function(err, results) {
    bench_utils.show_statistics(statistics);
    bench_utils.show_notes();
    process.exit(0);
});



