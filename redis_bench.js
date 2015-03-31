var async = require('async');
var fs = require('fs');
var split = require('split');
var redis = require('redis');

var bench_utils = require('./bench_utils');
var consts = require('./consts');
var bench_info = require('./bench_info');

var statistics = bench_info.redis;
var client = redis.createClient();


function drop_ranking_collection(next) {

    client.del( 'ranking', function(err, replay) {
        console.log('- ranking key deleted');
        next(null);
    });

}

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

            client.zadd( [ 'ranking', Number(fields[2]), fields[1]], function(err, data) {

                var elapsed = process.hrtime(timer);
                statistics.save_time.time += elapsed[0] * 1e9 + elapsed[1];

                statistics.save_time.counter--;

                // end of entries
                if ( statistics.save_time.counter === 0)
                    next(null);
            
            });
        });
}

function retrieve_user_score(next) {
    statistics.retrieve_user_score.user =
        bench_utils.params( statistics.retrieve_user_score.user, process.argv[2]);
    console.log('- retrieving %s score...', statistics.retrieve_user_score.user);

    var timer = process.hrtime();

    client.zscore( ['ranking', statistics.retrieve_user_score.user], function(err, result) {
        var elapsed = process.hrtime(timer);
        statistics.retrieve_user_score.time += elapsed[0] * 1e9 + elapsed[1];
        statistics.retrieve_user_score.score = result;

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
    client.zadd( [ 'ranking', statistics.alter_user_score.new_score_value, statistics.alter_user_score.user], function(err, result) {
        var elapsed = process.hrtime(timer);
        statistics.alter_user_score.time += elapsed[0] * 1e9 + elapsed[1];
        
        next(null);
    });
}

function retrieve_top_n(next) {

    console.log("- retrieving first %d users...", Number(statistics.top_n.n));

    var timer = process.hrtime();
    client.zrevrange( ['ranking', 0, Number(statistics.top_n.n - 1), 'withscores'], function(err, results) {
        var elapsed = process.hrtime(timer);
        statistics.top_n.time += elapsed[0] * 1e9 + elapsed[1];

        console.log(results);
        next(null);
    });
}

function retrieve_ranking(next) {
    statistics.ranking.user =
        bench_utils.params(statistics.ranking.user, process.argv[2]);

    console.log("- retrieving ranking for %s...", statistics.ranking.user);

    var timer = process.hrtime();
    client.zrevrank( ['ranking', statistics.ranking.user], function(err, results) {
        var elapsed = process.hrtime(timer);
        statistics.ranking.time += elapsed[0] * 1e9 + elapsed[1];
        statistics.ranking.rank = results;
        console.log("ranking for %s is %d", statistics.ranking.user, statistics.ranking.rank);

        next(null);
    });
}

bench_utils.track_memory_usage(statistics.memory_usage);

async.series( [
    drop_ranking_collection,
    count_scores_entries,
    save_entries,
    retrieve_user_score,
    alter_user_score,
    retrieve_top_n,
    retrieve_ranking
], function(err, results) {
    bench_utils.show_statistics(statistics);
    console.log();
    
    client.info( ['memory'], function(err, results ) {
        console.log('REDIS - MEMORY USAGE');
        console.log( results);
        console.log();
        bench_utils.show_notes();
        console.log();
        process.exit(0);
    });



});

