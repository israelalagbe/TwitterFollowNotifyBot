
require('dotenv').config();
const { analyzeSubscriber } = require('./helpers/AppService');
const logger = require('./config/logger');
const User = require('./models/user');
const mongoose = require('mongoose');

mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
    console.log("Connected to mongodb")
  }).catch((e)=>{
    logger.error("Cron: error connecting to mongo: "+e)
  });
  

(async () => {
    const user = await User.findOne({username: "FollowNotifyBot"});
    try{
        await analyzeSubscriber(user);
        console.log("Done")
    }
    catch(e){
        console.error(e)
    }
    

})();