const querystring = require('querystring');
const request = require('request');
const removeNullItem = require('./removeNullItem');

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
            ...removeNullItem({...params})
        });

        console.log(query)
        requestMethod(`${url}${query?'?'+query: ''}`, {
            timeout: 60000,
            oauth: {
                ...oauth
            },
            ...(['post'].includes(method) ? {
                form: removeNullItem({...body})
            } : null)
            // @ts-ignore
        }, (err, response, body) => {
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