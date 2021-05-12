// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const { default: axios } = require('axios');
var cron = require('node-cron');
const logger = require('./config/logger');

const { limitFollowersCall } = require("./helpers/rate_limiters");

// const redis = require("redis");
// const client = redis.createClient();


// const quota = {
//     fastStart: false,
//     interval: 30000,             // 1000 ms == 1 second
//     rate: 1,                   // 30 API calls per interval
//     concurrency: 1,            // no more than 10 running at once
//     maxDelay: 3000000              // an API call delayed > 2 sec is rejected
// };

// const channelName = 'twitter-api';
// // Create a RedisQuotaManager
// const qm = new RedisQuotaManager(
//     quota,
//     channelName,
//     client
// );

// const limit = pRateLimit(qm);

// console.time("rate");

// (async () => {
//     console.timeLog('rate')
//    for (let index = 0; index < 10; index++) {
//     await limitFollowersCall()
//     console.timeLog('rate')
//    }
// })();
console.time('cron')
cron.schedule('* * * * * *', async () => {
    
    try{
        await limitFollowersCall()
        await axios.get('http://localhost:8005/api/user')
        console.timeLog('cron')
    }
    catch(e) {
        // logger.error("cron error", e)
        process.exit(1);
    }
    
    
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });
 