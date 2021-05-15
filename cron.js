// const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const {
  default: axios
} = require('axios');
const mongoose = require('mongoose');
var cron = require('node-cron');
require('dotenv').config();
const logger = require('./config/logger');


const { analyzeFollowers } = require('./helpers/AppService');

const Bot = require('./helpers/Bot');
const pause = require('./helpers/pause');


const {
  limitFollowersCall
} = require("./helpers/rate_limiters");

mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
  console.log("Connected to mongodb")
}).catch((e)=>{
  logger.error("Cron: error connecting to mongo: "+e)
});


(async () => {
  
  while(true) {
    await analyzeFollowers()
    await pause(1000)
  }
})();

console.time('cron')
// cron.schedule('* * * * * *', async () => {
//   try {
//     console.log("hehe")
//     // await axios.get('http://localhost:8005/api/user')
//     console.timeLog('cron')
//   } catch (e) {
//     // logger.error("cron error", e)
//     // process.exit(1);
//   }


// }, {
//   scheduled: true,
//   timezone: "Africa/Lagos"
// });