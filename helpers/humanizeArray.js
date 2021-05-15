/**
 * 
 * @param {(String|Number)[]} items 
 * @returns 
 */
module.exports = (items) => {
    if(items.length === 1) return items[0];
    const last = items.pop();
    return items.join(', ') + ' and ' + last;
}