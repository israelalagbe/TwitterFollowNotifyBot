/**
 * @param {number} ms 
 * @returns
 */
module.exports = (ms)=>{
    return new Promise((resolve, reject)=>{
        setTimeout(() => {
            resolve();
        }, ms);
    })
}