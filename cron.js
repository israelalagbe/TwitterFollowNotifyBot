// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const {
  default: axios
} = require('axios');
const mongoose = require('mongoose');
var cron = require('node-cron');
require('dotenv').config();
const logger = require('./config/logger');


const { analyzeSubscribersFollowers, advertiseBot, followUserFollower, pruneFollowing } = require('./helpers/AppService');

const Bot = require('./helpers/Bot');
const pause = require('./helpers/pause');


mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
  console.log("Connected to mongodb")
}).catch((e)=>{
  logger.error("Cron: error connecting to mongo: "+e)
});


(async () => {
  
  while(true) {
    await analyzeSubscribersFollowers()
  }
})();

//Run every 4 hours
// cron.schedule('0 */4 * * *', async () => {
//   try {
//     logger.error("advert started")
//     await advertiseBot();
//   } catch (e) {
//     logger.error("cron error", e)
//     // process.exit(1);
//   }

// }, {
//   scheduled: true,
//   timezone: "Africa/Lagos"
// });


// Run every 6 hours
// cron.schedule('0 */6 * * *', async () => {
//   try {
//     logger.error("auto following started")
//     await followUserFollower();
//   } catch (e) {
//     logger.error("auto following cron error", e)
//     // process.exit(1);
//   }

// }, {
//   scheduled: true,
//   timezone: "Africa/Lagos"
// });


cron.schedule('0 0 1 * *', async () => {
  try {
    logger.error("auto unfollowing started")
    await pruneFollowing('FollowNotifyBot');
  } catch (e) {
    logger.error("auto unfollowing cron error", e)
    // process.exit(1);
  }

}, {
  scheduled: true,
  timezone: "Africa/Lagos"
});