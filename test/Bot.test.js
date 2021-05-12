const Twit = require('twit');
const Bot = require('../helpers/Bot');
const getPromiseCallback = require('../helpers/getPromiseCallback');

jest.mock('twit', () => class {
    post(_, __, callback) {callback(null,'Response')}

});

describe('Bot Test', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.resetAllMocks()
      jest.restoreAllMocks()
    });

    it('Bot.tweet() should have been valled', () => {
      
      const spy = jest.spyOn(Bot._twit, 'post')
      Bot.tweet("Hello everyone")
      expect(spy).toHaveBeenCalled()
    })
    it('Bot.tweet() argument test', () => {

      const status = "Hello everyone";

      const spy = jest.spyOn(Bot._twit, 'post')
      Bot.tweet(status)

      expect(spy).toHaveBeenCalledWith('statuses/update', {status}, expect.anything())
    })

    it('Bot.tweet() should return correct value', async () => {

      const status = "Hello everyone";

      const response = Bot.tweet(status)
      
      expect(response).toBeInstanceOf(Promise)
      expect(await response).toBe("Response")
      
    })
});