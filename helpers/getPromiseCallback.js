/**
 * @param {object} param
 * @param {Error} param.err
 * @param {Object} param.data
 * @param {Object} param.response
 */
 function getPromiseCallback() {
    let cbs = {};

    const promise = new Promise((resolve, reject)=> {
        cbs = {resolve, reject};
    });

    const callback = ({err, data, response}) => {
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