var async = require('async');
var fs = require('fs');
var split = require('split');
var mongojs = require('mongojs');

var consts = require('./consts');

var db = mongojs( 'leaderboard', ['ranking']);

var bench_info = {
    score_entries: {
        desc: 'number of records processed',
        count: 0
    },
    save_time: {
        desc: 'time invested into mongodb save function',
        time: 0,
        counter: 0
    },
    retrieve_user_score: {
        desc: 'time spent retrieving user score',
        user: 'user_1',
        score: 0,
        time: 0
    },
    alter_user_score: {
        desc: 'time spent changing user score',
        user: 'user_1',
        new_score_value: 59,
        time: 0
    }
};


function dump_statistics() {
    console.log( "number of users:", number_of_scores);
    console.log( "saving time: %d ns", save_time);
}

function drop_ranking_collection(next) {
    db.ranking.drop( function() {
        console.log( 'collection droped');
        next(null);
    } );
}

function count_scores_entries(next) {
    console.log('counting lines of %s...', consts.ranking_filename)
    fs.createReadStream(consts.ranking_filename)
        .pipe(split())
        .on('data', function(line) {
            // End of file
            if ( line.length === 0 ) {
                next(null);
                return;
            }


            bench_info.score_entries.count++;

        })
};

function save_entries(next) {
    console.log( 'invoking db.ranking.save for %d records...', bench_info.score_entries.count);
    bench_info.save_time.counter = bench_info.score_entries.count;
    fs.createReadStream(consts.ranking_filename)
        .pipe(split())
        .on('data', function(line) {
            // End of file
            if ( line.length === 0 )
                return;

            var fields = line.split('|');
            
            var timer = process.hrtime();
            db.ranking.save( { user: fields[1], score: fields[2] }, function(err, doc) {
                var elapsed = process.hrtime(timer);
                bench_info.save_time.time += elapsed[0] * 1e9 + elapsed[1];

                bench_info.save_time.counter--;

                // end of entries
                if ( bench_info.save_time.counter === 0)
                    next(null);
            
            });
        });
}

function build_index_on_ranking(next) {
    console.log('creating index for ranking on score...');
    db.ranking.createIndex( {score: 1 }, function() {
        next(null);
    });

};

function retrieve_user_score(next) {
    bench_info.retrieve_user_score.user =
        params( bench_info.retrieve_user_score.user, process.argv[2]);
    console.log( 'retrieving %s score...', bench_info.retrieve_user_score.user);

    var timer = process.hrtime();
    db.ranking.find(
        { user: bench_info.retrieve_user_score.user },  /* query */
        { score: 1},                                    /* projection */
        function(err, docs) {
            var elapsed = process.hrtime(timer);
            bench_info.retrieve_user_score.time += elapsed[0] * 1e9 + elapsed[1];
            bench_info.retrieve_user_score.score = docs[0].score;

            next(null);
        });
        
}

function alter_user_score(next) {
    bench_info.alter_user_score.user =
        params(bench_info.alter_user_score.user, process.argv[2]);

    bench_info.alter_user_score.new_score_value =
        params( bench_info.alter_user_score.new_score_value, process.argv[3] );
                
    console.log( 'altering %s score...', bench_info.alter_user_score.user);

    var timer = process.hrtime();
    db.ranking.update(
        { user: bench_info.alter_user_score.user },  /* query */
        { $set:
          { score: Number(bench_info.alter_user_score.new_score_value)}
        },
        function(err, docs) {
            var elapsed = process.hrtime(timer);
            bench_info.alter_user_score.time += elapsed[0] * 1e9 + elapsed[1];
            
            next(null);
        });
        

}

async.series( [
    drop_ranking_collection,
    count_scores_entries,
    save_entries,
    build_index_on_ranking,
    retrieve_user_score,
    alter_user_score
], function(err, results) {
    console.log( "%s: %d", bench_info.score_entries.desc, bench_info.score_entries.count);
    console.log( "%s: %d ns", bench_info.save_time.desc, bench_info.save_time.time );
    console.log( "%s: %d ns", bench_info.retrieve_user_score.desc, bench_info.retrieve_user_score.time );
    console.log( "%s: %d ns", bench_info.alter_user_score.desc, bench_info.alter_user_score.time );
    
    console.log("");
    console.log("NOTE");
    console.log("- Every time is expresed in nanoseconds");
    console.log("- For those operation where user is a parameter first argument might be specified");
    process.exit(0);
});



function params(defaultValue, newValue) {
    if ( newValue === undefined)
        return defaultValue;

    return newValue;
}
