
require('dotenv').config();
const { analyzeSubscriber, advertiseBot ,followUserFollower } = require('./helpers/AppService');
const logger = require('./config/logger');
const User = require('./models/user');
const mongoose = require('mongoose');
const Bot = require('./helpers/Bot');
const Twit = require('twit');

const config = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
}
mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
    console.log("Connected to mongodb")
  }).catch((e)=>{
    logger.error("Cron: error connecting to mongo: "+e)
  });
  

(async () => {
    // const user = await User.findOne({username: "FollowNotifyBot"});
    try{
    //   const tweets = await Bot.searchTweets({
    //     count: 5,
    //     q: "I have built a Bot helps monitor your unfollowers and alerts you when someone unfollows you"
    // });
    // console.log(JSON.stringify(tweets[0]))
      // Bot.tweet({status: "Hello world!"});
        await followUserFollower();

        // const twit = new Twit(config);
        // var filePath = 'public/botScreenshot.jpg'
        // const res = await Bot.uploadMedia(filePath)
        // console.log("Done", JSON.stringify(res))
    }
    catch(e){
        console.error(e)
    }
    

})();