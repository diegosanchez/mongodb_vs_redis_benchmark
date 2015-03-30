var info = {
    ranking: {
        desc: 'ranking for user',
        user: 'user_1',
        time: 0,
        rank: 0
    },
    memory_usage: {
        desc: 'memory usage rss',
        min_rss: null,
        max_rss: 0,
        min_heap_total: null,
        max_heap_total: 0,
        min_heap_used: null,
        max_heap_used: 0
    },
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
    },
    top_n: {
        desc: 'time spent retreaving top N users',
        n: 100,
        time: 0
    }
};

exports.mongodb = JSON.parse(JSON.stringify(info));
exports.redis = JSON.parse(JSON.stringify(info));
