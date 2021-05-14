const express = require('express');

const Twit = require('twit')
const axios = require('axios').default;
const md5 = require('md5');
const logger = require('../config/logger');
const Bot = require('../helpers/Bot');
const User = require('../models/User');





var router = express.Router();





/* GET home page. */
router.get('/', async (req, res, next) => {

  //   console.time('debug')
  //   const count = 1000000
  //   const arrayItems = new Array(count).fill("jdjdjdjdjdjdj").join('')
  //   const arrayItems2 = new Array(count).fill("jdjdjdjdjdjdj").join('')

  //   if(md5(arrayItems) === md5(arrayItems2)){
  //     console.log("yes way", count);
  //   }
  //   console.timeEnd('debug')

  //   const b = arrayItems.length * 2;
  // const kb = (b / 1024).toFixed(2);

  // console.log(`${kb}KB`);



  // const response = await Bot.tweet("Second Bot test")
  // logger.info("Item",response)
  // console.log(await Bot.getFollowers({user_id: 3062433100}))
  //   const config = {
  //     consumer_key: process.env.consumer_key,
  //     consumer_secret: process.env.consumer_secret,
  //     access_token: process.env.access_token,
  //     access_token_secret: process.env.access_token_secret,
  //     timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  // }
  //   const twit = new Twit(config);
  //   twit.get('https://api.twitter.com/oauth/request_token',(err, response) => {logger.info("Here", err, response)})
  // await User.create({
  //   username: 'israelalagbe'
  // })
  // const user = await User.findOne()
  // console.log({user})
  res.render('index');
});

router.post('/subscribe', async (req, res, next) => {

  try {
    const result = await Bot.requestToken()
    res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${result.oauth_token}`);
  } catch (e) {
    res.status(400).json({
      e
    });
    logger.error(e)
  }
});

router.get('/success', async (req, res, next) => {
  /**
   * @type {any}
   */
  const query = req.query;

  try {
    const userAccessToken = await Bot.getAccessToken(query)
    const twitterUser = await Bot.getUserCredentials(userAccessToken)
    const followers = await Bot.getFollowers({
      user_id: twitterUser.id_str
    });

    if(twitterUser.id_str === '1256620641706561536') {
      res.status(400).send("<h1>You cannot subscribe yourself<h1/>");
    }

    const update = {
      $set: {
        name: twitterUser.name,
        username: twitterUser.screen_name,
        access_token: userAccessToken.oauth_token,
        access_token_secret: userAccessToken.oauth_token_secret,
        followers_count: twitterUser.followers_count,
        following_count: twitterUser.friends_count,
        email: twitterUser.email,
        twitter_user_id: twitterUser.id_str,
        followers: followers.ids
      }
    };

    const user = await User.updateOne({
      twitter_user_id: twitterUser.id_str
    }, update, {
      upsert: true
    });
   

    await Bot.sendDirectMessage(twitterUser.id_str, `Hello ${twitterUser.name},\n Your subscription is successful!`)

    console.log({
      followers,
      twitterUser
    })
    res.send("done")
    // res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${result.oauth_token}`);
  } catch (e) {
    logger.error(e)
    res.status(400).send("<h1>Opps, Something went went<h1/>");

  }
});
module.exports = router;