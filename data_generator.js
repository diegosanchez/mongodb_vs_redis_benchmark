var consts = require('./consts');
var fs = require('fs');
var util = require('util');

try { fs.unlinkSync( consts.ranking_filename ); } catch (err) {};

function rnd(min, max) {
    return Math.floor((Math.random() * max) + min);
};

for( var i = 0; i < consts.scores_count; ++i ) {
    // ID Ranking | ID User | score 
    var entry = util.format("%s|%s|%d\n", "ranking:1:users", "user_" + i, rnd( 1, consts.scores_count) );

    fs.appendFileSync( consts.ranking_filename, entry);

    
};
