
require('dotenv').config();
const { analyzeSubscriber, advertiseBot } = require('./helpers/AppService');
const logger = require('./config/logger');
const User = require('./models/user');
const mongoose = require('mongoose');
const Bot = require('./helpers/Bot');

mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
    console.log("Connected to mongodb")
  }).catch((e)=>{
    logger.error("Cron: error connecting to mongo: "+e)
  });
  

(async () => {
    // const user = await User.findOne({username: "FollowNotifyBot"});
    try{
      Bot.tweet({status: "Hello world!"});
        // await advertiseBot();
        console.log("Done")
    }
    catch(e){
        console.error(e)
    }
    

})();