const logger = require("../config/logger");
const User = require("../models/User");
const Bot = require("./Bot");

/**
 * @param {GetAccessTokenResponse} userAccessToken
 * @param {User} twitterUser 
 */
 exports.addUserDetails = async (userAccessToken, twitterUser) => {
    const followers = await Bot.getAllFollowers({
      user_id: twitterUser.id_str,
      chunkSize: 5000,
      rateLimitPoint: 10,
      auth: {
        token: userAccessToken.oauth_token,
        token_secret: userAccessToken.oauth_token_secret
      }
    });
  
    
  
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
        followers
      }
    };
  
    const user = await User.updateOne({
      twitter_user_id: twitterUser.id_str
    }, update, {
      upsert: true
    });
   
  
    await Bot.sendDirectMessage(twitterUser.id_str, `Hello ${twitterUser.name}, your subscription is successful!`)
  
    logger.info({
      message: 'registered',
      followers,
      twitterUser
    })
  }
 