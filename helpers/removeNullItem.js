module.exports = function removeNullItems(items){
    const obj = {};
    Object.keys(items)
      .filter((key) => items[key])
      .forEach((key) => (obj[key] = items[key]));
    return obj;
};