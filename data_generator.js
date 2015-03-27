var fs = require('fs');
var util = require('util');

var ranking_filename = 'ranking.lst';
var scores_count = 1000000;

try { fs.unlinkSync( ranking_filename ); } xcatch (err) {};

for( var i = 0; i < scores_count; ++i ) {
    // ID Ranking | ID User | score 
    var entry = util.format("%s|%s|%d\n", "ranking:1:users", "user_" + i, i );

    fs.appendFileSync( ranking_filename, entry);

    
};
