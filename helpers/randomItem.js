/**
 * @template T
 * @param {T[]} arr 
 * @returns {T}
 */
module.exports = function randomItem(arr) {
    var index = Math.floor(arr.length * Math.random());
    return arr[index];
};