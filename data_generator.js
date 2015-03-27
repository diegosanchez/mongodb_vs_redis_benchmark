var consts = require('./consts');
var fs = require('fs');
var util = require('util');

try { fs.unlinkSync( consts.ranking_filename ); } catch (err) {};

for( var i = 0; i < consts.scores_count; ++i ) {
    // ID Ranking | ID User | score 
    var entry = util.format("%s|%s|%d\n", "ranking:1:users", "user_" + i, i );

    fs.appendFileSync( consts.ranking_filename, entry);

    
};
