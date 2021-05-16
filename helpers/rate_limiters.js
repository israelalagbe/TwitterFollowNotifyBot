const {
    pRateLimit,
    RedisQuotaManager
} = require('p-ratelimit');

const redis = require("redis");
const logger = require('../config/logger');
const client = redis.createClient();
const getPromiseCallback = require('../helpers/getPromiseCallback');

client.on("error", function (err) {
    logger.error("Redis error", err)
});
const maxDelay = 1000 * 60 * 60 * 24 * 7;

var RateLimit = require('ratelimit.js').RateLimit;


var rules = [{
    interval: 1000,
    limit: 5
}];

// You can define a prefix to be included on each redis entry
// This prevents collisions if you have multiple applications
// using the same redis db

const rateLimiter = ({
    interval,
    limit
}) => {
    let totalCall = 0;
    let lastCall = null
    const intervalInMilSec = interval * 1000;
    let returnCount = 0;
    let nextTimeoutTime = null;

    /**
     * @type Promise
     */
    let promise;

    const createPromise = (timeout) => {
        return new Promise((resolve, reject) => {

            setTimeout(() => {
                lastCall = null;
                totalCall = 0;
                promise = null;
                returnCount = limit;

                resolve()
            }, timeout);
        })
    }
    return () => {

        totalCall++;

        if (!lastCall)
            lastCall = Date.now();

        if (!promise) {
            nextTimeoutTime = Date.now() + intervalInMilSec;
            promise = createPromise(intervalInMilSec)
        }
        if (returnCount > 0) {
            console.log(returnCount )
            // return new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve()
            //     }, Date.now() - intervalInMilSec);
            // })

        }

        if (totalCall > limit) {
            returnCount++;
            return promise;
        }

        return Promise.resolve()


    }
}
const l = rateLimiter({
    interval: 5,
    limit: 1
})

const followerLimiterWait = () => l()
module.exports = {
    limitFollowersCall: () => followerLimiterWait()
}