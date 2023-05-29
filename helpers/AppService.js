const logger = require("../config/logger");
const User = require("../models/user");
const Bot = require("./Bot");
const findUnfollowers = require("./findUnfollowers");
const humanizeArray = require("./humanizeArray");
const pause = require("./pause");
const randomItem = require("./randomItem");

const followBotTwitterId = "1256620641706561536";

/**
 * @param {GetAccessTokenResponse} userAccessToken
 * @param {User} twitterUser
 */
exports.addUserDetails = async (userAccessToken, twitterUser) => {
  await Bot.followUser({
    user_id: followBotTwitterId,
    auth: {
      token: userAccessToken.oauth_token,
      token_secret: userAccessToken.oauth_token_secret,
    },
  });

  const followers = await Bot.getAllFollowers({
    user_id: twitterUser.id_str,
    chunkSize: 5000,
    rateLimitPoint: 10,
    auth: {
      token: userAccessToken.oauth_token,
      token_secret: userAccessToken.oauth_token_secret,
    },
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
      followers,
      consecutive_failed_call_count: 0
    },
  };

  const user = await User.updateOne(
    {
      twitter_user_id: twitterUser.id_str,
    },
    update,
    {
      upsert: true,
    }
  );

  await Bot.sendDirectMessage(
    twitterUser.id_str,
    `Hello ${twitterUser.name}, your subscription was successful!\nI will run analysis on your account every 2 hours.`
  );
  
  const timeToTweet = 1000 * 60 * 60 * 3;
  // setTimeout(async() => {
  //   await Bot.tweet({
  //     status: `This Bot tells me when someone unfollows me.\n@FollowNotifyBot`,
  //     auth: {
  //       token: userAccessToken.oauth_token,
  //       token_secret: userAccessToken.oauth_token_secret,
  //     },
  //   });
  // }, timeToTweet);
};

exports.analyzeSubscriber = async (user) => {
  const oldFollowers = user.followers;

  const newFollowers = await Bot.getAllFollowers({
    user_id: user.twitter_user_id,
    chunkSize: 5000,
    rateLimitPoint: 10,
    auth: {
      token: user.access_token,
      token_secret: user.access_token_secret,
    },
  });

  const unfollowers = findUnfollowers(oldFollowers, newFollowers);

  //To fix the bug of sample unfollower reported multiple time
  const filteredUnfollowers = unfollowers
    .filter((unfollower) => !user.all_unfollows.includes(unfollower))
    .slice(0, 20);

  if (filteredUnfollowers.length) {
    const users = (
      await Bot.getUsers({
        auth: {
          token: user.access_token,
          token_secret: user.access_token_secret,
        },
        ids: filteredUnfollowers,
      })
    ).filter((user) => !(user.username === "IsraelAlagbe" || user.username === "FollowNotifyBot"));

    if (users.length) {
      const unFollowersUsernames = users.map((item) => "@" + item.username);

      const message = `Hello ${user.name},\n${humanizeArray(
        unFollowersUsernames
      )} has unfollowed you!`;

      logger.info(message);

      await Bot.sendDirectMessage(user.twitter_user_id, message);

      // if (user.username === 'IsraelAlagbe' || user.username === 'FollowNotifyBot') {
      //     logger.info("WrongFollowers debugging message", {
      //         username: user.username,
      //         message,
      //         oldFollowers: JSON.stringify(oldFollowers),
      //         newFollowers: JSON.stringify(newFollowers)
      //     })
      // }
    }
  }

  user.followers = newFollowers;
  user.all_unfollows = Array.from(new Set([...user.all_unfollows, ...unfollowers]));
  user.consecutive_failed_call_count = 0;

  await user.save();
};

exports.analyzeSubscribersFollowers = async () => {
  const analysisStart = Date.now();

  const chunkSize = 10;
  const usersIterator = await this.getUsersByChunkSize(chunkSize);
  for await (const user of usersIterator) {
    try {
      await this.analyzeSubscriber(user);
    } catch (e) {
      logger.error("analyzeSubscriber error", {
        error: JSON.stringify(e),
        user: {
          username: user.username,
          name: user.name,
        },
      });
      user.consecutive_failed_call_count = user.consecutive_failed_call_count || 0;
      user.consecutive_failed_call_count++;
      user.save();
    }
  }

  const analySisEnd = Date.now();

  const runningTime = analySisEnd - analysisStart;

  logger.info("Analysis ends in: ", Math.round(runningTime / 1000) + " sec");

  const breakTime = 1000 * 60 * 60 * 2;
  // const breakTime = 1000 * 60 * 2

  if (runningTime < breakTime) {
    await pause(breakTime - runningTime);
  }

  logger.info({
    breakTime: Math.round((Date.now() - analySisEnd) / 1000) + " sec",
    totalRunningTime: Math.round((Date.now() - analysisStart) / 1000) + " sec",
  });
};

exports.advertiseBot = async () => {
  const searchKeywords = ["how many followers do you want", "followers OR following"];

  const tweets = await Bot.searchTweets({
    count: 20,
    q: randomItem(searchKeywords),
  });

  const tweet = randomItem(tweets);

  const status = `I can help you monitor your unfollowers and notify you via DM when someone unfollows you. Click the link below to sign up:\nhttps://follownotifybot.xyz/`;

  var filePath = "public/botScreenshot.jpg";
  const media = await Bot.uploadMedia(filePath);

  await Bot.tweet({
    status,
    in_reply_to_status_id: tweet.id_str,
    media_ids: media.media_id_string,
  });
};

exports.followUserFollower = async () => {
  const users = await User.find({
    username: {
      $ne: "FollowNotifyBot",
    },
  });

  const user = randomItem(users);

  const botUser = await User.findOne({
    username: "FollowNotifyBot",
  });
  /**
   * @type {String[]}
   */
  const botFollowers = botUser.followers;
  /**
   * @type {String[]}
   */
  const userFollowers = user.followers;

  //FIND user followers that is not following me
  const usersToFollow = userFollowers.filter((x) => !botFollowers.includes(x));

  const singleUserToFollowId = randomItem(usersToFollow);

  const singleUserToFollow = (
    await Bot.getUsers({
      auth: {
        token: user.access_token,
        token_secret: user.access_token_secret,
      },
      ids: [singleUserToFollowId],
    })
  )[0];

  await Bot.followUser({
    user_id: singleUserToFollowId,
    auth: {
      token: process.env.access_token,
      token_secret: process.env.access_token_secret,
    },
  });

  await Bot.sendDirectMessage(
    followBotTwitterId,
    `Automatic following: @${singleUserToFollow.username}`
  );

  logger.info("Bot now following", singleUserToFollow);
};

/**
 * @param {string} username
 */
exports.pruneFollowing = async (username) => {
  const user = await User.findOne({
    username,
  });

  const followers = await Bot.getAllFollowers({
    user_id: user.twitter_user_id,
    chunkSize: 5000,
    rateLimitPoint: 10,
    auth: {
      token: user.access_token,
      token_secret: user.access_token_secret,
    },
  });

  const followings = await Bot.getAllFollowing({
    user_id: user.twitter_user_id,
    chunkSize: 5000,
    rateLimitPoint: 10,
    auth: {
      token: user.access_token,
      token_secret: user.access_token_secret,
    },
  });

  const nonFollowerFollowings = followings.filter((userId) => !followers.includes(userId));

  for (const userId of nonFollowerFollowings) {
    await Bot.unfollowUser({
      user_id: userId,
      auth: {
        token: user.access_token,
        token_secret: user.access_token_secret,
      },
    });
  }
  console.log("Done unfollowing");
};

exports.getUsersByChunkSize = async function * (chunkSize = 10) { 
  
  const limit = chunkSize;
  let page = 1;
  // let startAt = (page * limit) - limit;
  const total = await User.countDocuments({});
  
  for(let startAt = 0; startAt < total; startAt += limit) {
    const users = await User.find({}).skip(startAt).limit(limit).lt('consecutive_failed_call_count', 20);

    for(const user of users) {
      yield user;
    }
    
  }
};