const logger = require("../config/logger");
const User = require("../models/user");
const Bot = require("./Bot");
const findUnfollowers = require("./findUnfollowers");
const humanizeArray = require("./humanizeArray");
const pause = require("./pause");

/**
 * @param {GetAccessTokenResponse} userAccessToken
 * @param {User} twitterUser 
 */
exports.addUserDetails = async (userAccessToken, twitterUser) => {

    const followBotTwitterId = "1256620641706561536";

    await Bot.followUser({
        user_id: followBotTwitterId,
        auth: {
            token: userAccessToken.oauth_token,
            token_secret: userAccessToken.oauth_token_secret
        }
    })

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


    await Bot.sendDirectMessage(twitterUser.id_str, `Hello ${twitterUser.name}, your subscription was successful!`)
}

const analyzeSubscriber = async (user) => {
    const oldFollowers = user.followers;



    const newFollowers = await Bot.getAllFollowers({
        user_id: user.twitter_user_id,
        chunkSize: 5000,
        rateLimitPoint: 10,
        auth: {
            token: user.access_token,
            token_secret: user.access_token_secret
        }
    });

    const unfollowers = findUnfollowers(oldFollowers, newFollowers);
    
    if(unfollowers.length) {

        const users = await Bot.getUsers({
            auth: {
                token: user.access_token,
                token_secret: user.access_token_secret
            },
            ids: unfollowers
        });
       
       if(users.length) {
        const unFollowersUsernames = users.map((item) => '@'+item.username)

        const message = `Hello ${user.name},\n${humanizeArray(unFollowersUsernames)} has unfollowed you!`;
        
        logger.info(message)

        await Bot.sendDirectMessage(user.twitter_user_id, message)
        user.followers = newFollowers;
        await user.save();
       }
        
    
        
    
        
        
    }
    
}

exports.analyzeSubscribersFollowers = async () => {
    const analysisStart = Date.now();

    const users = await User.find({});
    for (const user of users) {
        // console.log({user})
        try {
            await analyzeSubscriber(user);
        } catch (e) {
            logger.error("analyzeSubscriber error", {
                error: JSON.stringify(e),
                user: {
                    username: user.username,
                    name: user.name,
                }
            })
        }


    }

    const analySisEnd = Date.now();

    const runningTime = analySisEnd - analysisStart;



    logger.info("Analysis ends in: ", Math.round(runningTime / 1000) + " sec")

    const breakTime = 1000 * 60 * 60 * 2
    // const breakTime = 1000 * 60 * 2

    if (runningTime < breakTime) {
        await pause(breakTime - runningTime)
    }


    logger.info({
        breakTime: Math.round((Date.now() - analySisEnd) / 1000) + " sec",
        totalRunningTime: Math.round((Date.now() - analysisStart) / 1000) + " sec",
    })
}