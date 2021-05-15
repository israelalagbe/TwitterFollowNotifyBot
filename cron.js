// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const {
  default: axios
} = require('axios');
var cron = require('node-cron');
require('dotenv').config();
const logger = require('./config/logger');

const Bot = require('./helpers/Bot');

const {
  limitFollowersCall
} = require("./helpers/rate_limiters");


(async () => {
  
  try{
    const res = await Bot.getAllFollowers({
      user_id: '3062433100',
      chunkSize: 100,
      rateLimitPoint: 3,
      auth: {
        // consumer_key: process.env.consumer_key,
        // consumer_secret: process.env.consumer_secret,
        token: '1256620641706561536-4st8K8YB1DX27RWbUarwO5tFEYb21z',
        token_secret: 'hW2syg8tjPZlEZuKOybzZNyJFunlcHybDoiCiO40QKDz0'
      }
    })
    logger.info({
      res: res
    })
  }
  catch(err) {
    logger.error("cron error", err)
  }
})();

console.time('cron')
// cron.schedule('* * * * * *', async () => {
//   try {
//     const res = await Bot.getFollowers({
//       user_id: '1256620641706561536',
//       auth: {
//         consumer_key: process.env.consumer_key,
//         consumer_secret: process.env.consumer_secret,
//         token: '1256620641706561536-4st8K8YB1DX27RWbUarwO5tFEYb21z',
//         token_secret: 'hW2syg8tjPZlEZuKOybzZNyJFunlcHybDoiCiO40QKDz0'
//       }
//     })
//     logger.info({
//       res
//     })
//     // await axios.get('http://localhost:8005/api/user')
//     console.timeLog('cron')
//   } catch (e) {
//     // logger.error("cron error", e)
//     process.exit(1);
//   }


// }, {
//   scheduled: true,
//   timezone: "Africa/Lagos"
// });