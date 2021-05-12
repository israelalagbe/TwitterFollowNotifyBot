const logger = require("../config/logger");

 function getPromiseCallback() {
    let cbs = {};

    const promise = new Promise((resolve, reject)=> {
        cbs = {resolve, reject};
    });

    /**
     * @param {Error} err
     * @param {Object} data
     * @param {Object} response
    */
    const callback = (err, data, response) => {
        if(err){
            return cbs.reject(err);
        }
        cbs.resolve(data);
    };

    

    return {
        callback,
        promise
    };
}

module.exports = getPromiseCallback;