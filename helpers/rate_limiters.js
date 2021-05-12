const { pRateLimit, RedisQuotaManager } = require('p-ratelimit');

const redis = require("redis");
const logger = require('../config/logger');
const client = redis.createClient();

client.on("error", function(err) {
    logger.error("Redis error", err)
});
const maxDelay = 1000 * 60 * 60 * 24 * 7;

/**
 * @param {string} channel
 * @param {number} rate 
 * @param {number} interval  Time to wait after exheeding rate
 */
const createLimit = (channel, rate, interval) => {
    const quota = {
        interval: interval * 1000,             // 1000 ms == 1 second
        rate,                   // 30 API calls per interval
        concurrency: 2,            // no more than 10 running at once
        maxDelay
    }

    const qm = new RedisQuotaManager(
        quota,
        channel,
        client
    );
    return pRateLimit(qm);
}

const followerLimiterWait = createLimit('followers', 10, 60);

module.exports = {
    limitFollowersCall: () => followerLimiterWait(()=> Promise.resolve('done'))
}