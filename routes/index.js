const express = require('express');

const Twit = require('twit')
const axios = require('axios').default;
const md5 = require('md5');
const logger = require('../config/logger');
const Bot = require('../helpers/bot');
const User = require('../models/user');
const {addUserDetails} = require('../helpers/appService');


var router = express.Router();

router.post('/subscribe', async (req, res, next) => {

  try {
    const result = await Bot.requestToken()
    res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${result.oauth_token}`);
  } catch (e) {
    logger.error(e)
    res.status(400).send("<h1>Opps, Something went wrong<h1/>");
    
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
    res.status(400).send("<h1>Opps, Something went wrong<h1/>");

  }
});
module.exports = router;