const express = require('express');

const Twit = require('twit')
const axios = require('axios').default;
const md5 = require('md5');
const logger = require('../config/logger');
const Bot = require('../helpers/Bot');
const User = require('../models/user');
const {addUserDetails} = require('../helpers/AppService');





var router = express.Router();





/* GET home page. */
// router.get('/', async (req, res, next) => {

//   //   console.time('debug')
//   //   const count = 1000000
//   //   const arrayItems = new Array(count).fill("jdjdjdjdjdjdj").join('')
//   //   const arrayItems2 = new Array(count).fill("jdjdjdjdjdjdj").join('')

//   //   if(md5(arrayItems) === md5(arrayItems2)){
//   //     console.log("yes way", count);
//   //   }
//   //   console.timeEnd('debug')

//   //   const b = arrayItems.length * 2;
//   // const kb = (b / 1024).toFixed(2);

//   // console.log(`${kb}KB`);
//   res.render('index');
// });



router.post('/subscribe', async (req, res, next) => {

  try {
    const result = await Bot.requestToken()
    res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${result.oauth_token}`);
  } catch (e) {
    logger.error(e)
    res.status(400).send("<h1>Opps, Something went went<h1/>");
    
  }
});


router.get('/success', async (req, res, next) => {
  /**
   * @type {any}
   */
  const query = req.query;

  if(!query.oauth_token){
    return res.redirect(`/`);
  }

  try {
    const userAccessToken = await Bot.getAccessToken(query)
    const twitterUser = await Bot.getUserCredentials(userAccessToken)
    addUserDetails(userAccessToken, twitterUser)
    res.render('success');
    
  } catch (e) {
    logger.error(e)
    res.status(400).send("<h1>Opps, Something went went<h1/>");

  }
});
module.exports = router;