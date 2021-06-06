// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const {
  default: axios
} = require('axios');
const mongoose = require('mongoose');
var cron = require('node-cron');
require('dotenv').config();
const logger = require('./config/logger');


const { analyzeSubscribersFollowers, advertiseBot } = require('./helpers/AppService');

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

//Run every 2 hours
cron.schedule('0 */2 * * *', async () => {
  try {
    logger.error("advert started")
    await advertiseBot();
  } catch (e) {
    logger.error("cron error", e)
    // process.exit(1);
  }

}, {
  scheduled: true,
  timezone: "Africa/Lagos"
});