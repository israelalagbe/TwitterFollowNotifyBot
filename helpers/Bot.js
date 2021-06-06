'use strict';

//  Bot
//  class for performing various twitter actions
//
const Twit = require('twit');
const getPromiseCallback = require('./getPromiseCallback');
const request = require('request');
const querystring = require('querystring');
// @ts-ignore
const {
    query
} = require('express');
const http = require('./http');
const pause = require('./pause');

const v1BaseUrl = 'https://api.twitter.com/1.1';


const config = {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
}
/**
 * 
 * @returns {Promise<{oauth_token:string, oauth_token_secret:string}>}
 */
exports.requestToken = async function () {
    return new Promise((resolve, reject) => {

        request.post(`https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent(process.env.oauth_callback)}`, {
            timeout: 60000,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret
            }
            // @ts-ignore
        // @ts-ignore
        }, (err, result, body) => {
            if (err) return reject(err);
            const res = querystring.decode(body)
            if (!res.oauth_token) {
                return reject(res)
            }

            resolve({
                // @ts-ignore
                oauth_token: res.oauth_token,
                // @ts-ignore
                oauth_token_secret: res.oauth_token_secret
            })

        })
    });
};

/**
 * @param {GetAccessTokenRequest} query
 * @returns {Promise<GetAccessTokenResponse>}
 */
exports.getAccessToken = async function (query) {
    return new Promise((resolve, reject) => {
        request.get(`https://api.twitter.com/oauth/access_token`, {
            timeout: 60000,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: query.oauth_token,
                verifier: query.oauth_verifier
            }
            // @ts-ignore
        // @ts-ignore
        }, (err, result, body) => {
            if (err) return reject(err);

            const res = querystring.decode(body)
            if (!res.user_id) {
                return reject(res)
            }
            // @ts-ignore
            resolve(res)

        })
    });
};

/**
 * @param {OAuthToken} query
 * @returns {Promise<User>}
 */
exports.getUserCredentials = async function (query) {
    return new Promise((resolve, reject) => {
        request.get(`${v1BaseUrl}/account/verify_credentials.json?include_email=true&skip_status=true&include_entities=false`, {
            timeout: 60000,
            oauth: {
                consumer_key: process.env.consumer_key,
                consumer_secret: process.env.consumer_secret,
                token: query.oauth_token,
                token_secret: query.oauth_token_secret
            },

            // @ts-ignore
        // @ts-ignore
        }, (err, result, body) => {
            if (err) return reject(err);
            const res = JSON.parse(body)
            if (!(res && res.id)) {
                reject(res)
            }
            // @ts-ignore
            resolve(res)
        })
    });
};

/**
 * Post a tweet
 * @param {string} status 
 * @returns {Promise}
 */
exports.tweet = function (status) {
    const twit = new Twit(config);

    const {
        callback,
        promise
    } = getPromiseCallback()
    if (typeof status !== 'string') {
        return callback(new Error('tweet must be of type String'));
    } else if (status.length > 280) {
        return callback(new Error('tweet is too long: ' + status.length));
    }

    twit.post('statuses/update', {
        status: status
    }, callback);

    return promise;
};

/**
 * Send a direct message to a user
 * @param {string} userId 
 * @param {string} message 
 * @returns {Promise}
 */
exports.sendDirectMessage = function (userId, message) {
    const twit = new Twit(config);
    
    const {
        callback,
        promise
    } = getPromiseCallback()
    if (typeof message !== 'string') {
        return callback(new Error('tweet must be of type String'));
    } else if (!userId || isNaN(Number(userId))) {
        return callback(new Error('Invalid user id provided'));
    }

    const payload = {
        event: {
            type: "message_create",
            message_create: {
                target: {
                    recipient_id: userId
                },
                message_data: {
                    text: message
                }
            }
        }
    };
    // @ts-ignore
    twit.post('direct_messages/events/new', payload, callback);

    return promise;
};



/**
 * 
 * @param {{
 *      next_cursor?:string,
 *      user_id?:string, 
 *      count?: number
 *      auth: HttpConfigParam['oauth']
 *   }} params 
 * @returns {Promise<{ids:string[], next_cursor_str:string}>}
 */
exports.getFollowers = async function (params) {
    return http(`${v1BaseUrl}/followers/ids.json`, {
        method: 'get',
        oauth: {
            ...params.auth,
            consumer_key: process.env.consumer_key,
            consumer_secret: process.env.consumer_secret,
        },
        params: {
            stringify_ids: true,
            user_id: params.user_id,
            ...(params.next_cursor ? {
                cursor: params.next_cursor
            } : null),
            count: params.count,
        }
    });
};


/**
 * 
 * @param {{
 *          user_id?:string, 
 *          chunkSize: number,
 *          auth: HttpConfigParam['oauth'],
 *          rateLimitPoint: number
 *      }} params 
 * @returns {Promise<string[]>}
 */
exports.getAllFollowers = async function (params) {
    let nextCursor = null;
    let followers = []
    //Pause after 10 calls
 
    let callCount = 0;
    do {
        callCount++;

        const result = await this.getFollowers({
            auth: params.auth,
            user_id: params.user_id,
            count: params.chunkSize,
            next_cursor: nextCursor,
        });

        followers = [...followers, ...result.ids];

        nextCursor = result.next_cursor_str;

        if(callCount % params.rateLimitPoint === 0) {
            const _15minutes = 1000 * 60 * 15;
            await pause(_15minutes)
            
        }
    }
    while(nextCursor && nextCursor!== '0');

    return followers;
    
}

/**
 * 
 * @param {{
 *      ids: String[]
 *      auth: HttpConfigParam['oauth']
 *   }} params 
 * @returns {Promise<{id: string, name: string, username: string}[]>}
 */
exports.getUsers = async function (params) {
    return http(`https://api.twitter.com/2/users`, {
        method: 'get',
        oauth: {
            ...params.auth,
            consumer_key: process.env.consumer_key,
            consumer_secret: process.env.consumer_secret,
        },
        params: {
            ids: params.ids.join(',')
        }
    }).then((result) => result.data || []);
};

/**
 * 
 * @param {{
 *      user_id?:string, 
 *      auth: HttpConfigParam['oauth']
 *   }} params 
 * @returns {Promise<{}>}
 */
 exports.followUser = function (params) {
    return http(`${v1BaseUrl}/friendships/create.json`, {
        method: 'post',
        oauth: {
            ...params.auth,
            consumer_key: process.env.consumer_key,
            consumer_secret: process.env.consumer_secret,
        },
        params: {
            user_id: params.user_id
        }
    });
};



// choose a random tweet and follow that user
exports.searchFollow = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        // @ts-ignore
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
exports.retweet = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        // @ts-ignore
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
exports.favorite = function (params, callback) {
    var self = this;

    self._twit.get('search/tweets', params, function (err, reply) {
        if (err) return callback(err);

        // @ts-ignore
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
exports.mingle = function (callback) {
    var self = this;

    twit.get('followers/ids', function (err, reply) {
        if (err) {
            return callback(err);
        }

        // @ts-ignore
        var followers = reply.ids,
            randFollower = randIndex(followers);

        self._twit.get('friends/ids', {
            user_id: randFollower
        }, function (err, reply) {
            if (err) {
                return callback(err);
            }

            // @ts-ignore
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
exports.prune = function (callback) {
    var self = this;

    twit.get('followers/ids', function (err, reply) {
        if (err) return callback(err);

        // @ts-ignore
        var followers = reply.ids;

        self._twit.get('friends/ids', function (err, reply) {
            if (err) return callback(err);

            // @ts-ignore
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