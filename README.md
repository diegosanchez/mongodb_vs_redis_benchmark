# Benchmark Redis vs Mongodb
## Running benchmark
**NOTE**: You need to have redis and mongodb installed.

1. clone repository: `git clone <proyect url>`
2. install dependencies: `npm install`
3. Prepearing data set: `node data_generator`
4. Start both services (mongodb and redis)
4. Running `redis` bench: `node redis_bench.js`
5. Running `mongodb` bench: `node db_becnh.js`


## Bench output
You might get the following results (depending on the data set )
### Mongo DB 
`node db_bench`

```
- collection droped
- counting lines of ranking.lst...
- invoking db.ranking.save for 100000 records...
- creating index for ranking on score...
- retrieving user_1 score...
- altering user_1 score...
- retrieving first 100 users...
...  
ranking omited on porpouse
...

STATISTICS:
number of records processed: 100000
time invested into mongodb save function: 84757949008979 ns
time spent retrieving user score: 587204090 ns
time spent changing user score: 9558199 ns
time spent retreaving top N users: 136924339 ns (N = 100 )

NODE - MEMORY USAGE
rss (min,max,avg) in bytes: (26787840, 67633152, 47210496) 
heapTotal (min,max,avg) in bytes: (18816128, 57675136, 38245632) 
heapUsed (min,max,avg) in bytes: (9293772, 41016272, 25155022) 

NOTE
- Every time measure is expresed in nanoseconds
- For those operation where user is a parameter first argument might be specified
```

### Redis 
`node redis_bench`

```
- ranking key deleted
- counting lines of ranking.lst...
- invoking db.ranking.save for 100000 records...
- retrieving user_1 score...
- altering user_1 score...
- retrieving first 100 users...
...  
ranking omited on porpouse
...
STATISTICS:
number of records processed: 100000
time invested into mongodb save function: 49070556007967 ns
time spent retrieving user score: 583400 ns
time spent changing user score: 370168 ns
time spent retreaving top N users: 801870 ns (N = 100 )

NODE - MEMORY USAGE
rss (min,max,avg) in bytes: (14598144, 34349056, 24473600) 
heapTotal (min,max,avg) in bytes: (9555584, 27216896, 18386240) 
heapUsed (min,max,avg) in bytes: (4297296, 15034980, 9666138) 


REDIS - MEMORY USAGE
# Memory
used_memory:10684632
used_memory_human:10.19M
used_memory_rss:12480512
used_memory_peak:10686736
used_memory_peak_human:10.19M
used_memory_lua:23552
mem_fragmentation_ratio:1.17
mem_allocator:jemalloc-3.6.0


NOTE
- Every time measure is expresed in nanoseconds
- For those operation where user is a parameter first argument might be specified
```
    
