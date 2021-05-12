const getPromiseCallback = require("../helpers/getPromiseCallback");

describe('getPromiseCallback test', () => {
    it('should return valid types', () => {
      const response = getPromiseCallback();
      expect(response).toBeInstanceOf(Object)
      expect(typeof response.callback).toBe('function')
      expect(response.promise).toBeInstanceOf(Promise)
    });

    it('should return valid callback data from promise', async () => {
      const {callback, promise} = getPromiseCallback();
      callback( null, "Hello world", null)
      const response = await promise;
      expect(response).toBe("Hello world")
    });

    it('should return valid callback data from promise',  () => {
      const {callback, promise} = getPromiseCallback();
      callback(new Error("The error"), null, null)
      
      expect(promise).rejects.toEqual(new Error("The error"));
    });
});
