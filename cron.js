// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const { default: axios } = require('axios');
var cron = require('node-cron');
const logger = require('./config/logger');

const { limitFollowersCall } = require("./helpers/rate_limiters");


console.time('cron')
cron.schedule('* * * * * *', async () => {
    try{
        const res = await limitFollowersCall()
        
        // await axios.get('http://localhost:8005/api/user')
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
 