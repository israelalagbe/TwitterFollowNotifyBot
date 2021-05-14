/**
 * 
 * @param {String[]} oldFollowers 
 * @param {String[]} newFollowers 
 * @returns {String[]}
 */
module.exports = (oldFollowers, newFollowers) => {
    return oldFollowers.filter(x => !newFollowers.includes(x));
}