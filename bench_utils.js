exports.params = function (defaultValue, newValue) {
    if ( newValue === undefined)
        return defaultValue;

    return newValue;
}

exports.track_memory_usage = function(memory_usage) {
    setInterval(function() {
        var memory = process.memoryUsage();

        // rss
        memory_usage.min_rss = ( memory_usage.min_rss === null ) ? ( memory.rss ) : Math.min(memory.rss, memory_usage.min_rss);
        memory_usage.max_rss = Math.max(memory.rss, memory_usage.max_rss);

        // total heap
        memory_usage.min_heap_total = ( memory_usage.min_heap_total === null ) ?
              memory.heapTotal : Math.min(memory.heapTotal, memory_usage.min_heap_total);
        memory_usage.max_heap_total = Math.max(memory.heapTotal, memory_usage.max_heap_total);
        
        // total used
        memory_usage.min_heap_used = ( memory_usage.min_heap_used === null) ?
            memory.heapUsed : Math.min(memory.heapUsed, memory_usage.min_heap_used);
        memory_usage.max_heap_used = Math.max(memory.heapUsed, memory_usage.max_heap_used);
        
        
        
    }, 500);
}

exports.show_statistics = function(statistics) {
    console.log();
    console.log("STATISTICS:")
    console.log( "%s: %d", statistics.score_entries.desc, statistics.score_entries.count);
    console.log( "%s: %d ns", statistics.save_time.desc, statistics.save_time.time );
    console.log( "%s: %d ns", statistics.retrieve_user_score.desc, statistics.retrieve_user_score.time );
    console.log( "%s: %d ns", statistics.alter_user_score.desc, statistics.alter_user_score.time );
    console.log( "%s: %d ns (N = %d )", statistics.top_n.desc, statistics.top_n.time, statistics.top_n.n);
    console.log();
    console.log("NODE - MEMORY USAGE");
    console.log("rss (min,max,avg) in bytes: (%d, %d, %d) ",
                statistics.memory_usage.min_rss,
                statistics.memory_usage.max_rss,
                (statistics.memory_usage.min_rss + statistics.memory_usage.max_rss) / 2 );
    console.log("heapTotal (min,max,avg) in bytes: (%d, %d, %d) ",
                statistics.memory_usage.min_heap_total,
                statistics.memory_usage.max_heap_total,
                (statistics.memory_usage.min_heap_total + statistics.memory_usage.max_heap_total) / 2);
    console.log("heapUsed (min,max,avg) in bytes: (%d, %d, %d) ",
                statistics.memory_usage.min_heap_used,
                statistics.memory_usage.max_heap_used,
                (statistics.memory_usage.min_heap_used + statistics.memory_usage.max_heap_used) / 2 );
    console.log("");

};

exports.show_notes = function() {
    console.log("NOTE");
    console.log("- Every time measure is expresed in nanoseconds");
    console.log("- For those operation where user is a parameter first argument might be specified");
}
