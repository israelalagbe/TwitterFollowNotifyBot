const querystring = require('querystring');
const request = require('request');

/**
 * 
 * @param {string} url 
 * @param {HttpConfigParam} config 
 */
module.exports = (url, {
    method,
    params,
    body,
    oauth
}) => {

    return new Promise((resolve, reject) => {
        const requestMethod = request[method];
        const query = querystring.stringify({
            ...params
        });

        requestMethod(`${url}${query?'?'+query: ''}`, {
            timeout: 60000,
            oauth: {
                ...oauth
            },
            ...(['post'].includes(method) ? {
                json: body
            } : null)
            // @ts-ignore
        }, (err, response, body) => {
            console.log(err, body, response.statusCode, JSON.stringify(response.headers))
            if (err) return reject(err);

            // const res = querystring.decode(body)

            if (response.statusCode >= 300) {
                return reject(JSON.parse(body))
            }
            // @ts-ignore
            resolve(JSON.parse(body))
        })
    });
};