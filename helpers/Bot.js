//
//  Bot
//  class for performing various twitter actions
//
const Twit = require('twit');
const getPromiseCallback = require('./getPromiseCallback');


var Bot = function () {
    const config = {
        consumer_key: process.env.consumer_key,
        consumer_secret: process.env.consumer_secret,
        access_token: process.env.access_token,
        access_token_secret: process.env.access_token_secret,
        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    }
    this._twit = new Twit(config);
};

/**
 * Post a tweet
 * @param {string} status 
 * @returns {Promise}
 */
Bot.prototype.tweet = function (status) {
    const {callback, promise} = getPromiseCallback()
    if (typeof status !== 'string') {
        return callback(new Error('tweet must be of type String'));
    } else if (status.length > 280) {
        return callback(new Error('tweet is too long: ' + status.length));
    }
    this._twit.post('statuses/update', {
        status: status
    }, callback);

    return promise;
};

// choose a random tweet and follow that user
Bot.prototype.searchFollow = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        var tweets = reply.statuses;
        var rTweet = randIndex(tweets)
        if (typeof rTweet != 'undefined') {
            var target = rTweet.user.id_str;

            self._twit.post('friendships/create', {
                id: target
            }, callback);
        }
    });
};

//
// retweet
//
Bot.prototype.retweet = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        var tweets = reply.statuses;
        var randomTweet = randIndex(tweets);
        if (typeof randomTweet != 'undefined')
            self._twit.post('statuses/retweet/:id', {
                id: randomTweet.id_str
            }, callback);
    });
};

//
// favorite a tweet
//
Bot.prototype.favorite = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        var tweets = reply.statuses;
        var randomTweet = randIndex(tweets);
        if (typeof randomTweet != 'undefined')
            self._twit.post('favorites/create', {
                id: randomTweet.id_str
            }, callback);
    });
};

//

//  choose a random friend of one of your followers, and follow that user
//
Bot.prototype.mingle = function (callback) {
    var self = this;

    this._twit.get('followers/ids', function (err, reply) {
        if (err) {
            return callback(err);
        }

        var followers = reply.ids,
            randFollower = randIndex(followers);

        self._twit.get('friends/ids', {
            user_id: randFollower
        }, function (err, reply) {
            if (err) {
                return callback(err);
            }

            var friends = reply.ids,
                target = randIndex(friends);

            self._twit.post('friendships/create', {
                id: target
            }, callback);
        })
    })
};

//
//  prune your followers list; unfollow a friend that hasn't followed you back
//
Bot.prototype.prune = function (callback) {
    var self = this;

    this._twit.get('followers/ids', function (err, reply) {
        if (err) return callback(err);

        var followers = reply.ids;

        self._twit.get('friends/ids', function (err, reply) {
            if (err) return callback(err);

            var friends = reply.ids,
                pruned = false;

            while (!pruned) {
                var target = randIndex(friends);

                if (!~followers.indexOf(target)) {
                    pruned = true;
                    self._twit.post('friendships/destroy', {
                        id: target
                    }, callback);
                }
            }
        });
    });
};

function randIndex(arr) {
    var index = Math.floor(arr.length * Math.random());
    return arr[index];
};

module.exports = new Bot();