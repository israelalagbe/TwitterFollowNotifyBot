const Twit = require('twit');
const Bot = require('../helpers/Bot');
const getPromiseCallback = require('../helpers/getPromiseCallback');
const http = require('../helpers/http');
const pause = require('../helpers/pause');


jest.mock('twit', () => class {
  post(_, __, callback) {
    callback(null, 'Response')
  }
  get(_, __, callback) {
    callback(null, 'Response')
  }

});

jest.mock('../helpers/rate_limiters', () => ({
  limitFollowersCall(){
    return Promise.resolve("yes")
  }

}))

jest.mock('../helpers/http');
jest.mock('../helpers/pause');



describe('Bot Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  });

  it('tweet() should have been called properly', () => {

    const spy = jest.spyOn(Bot._twit, 'post')
    Bot.tweet("Hello everyone")
    expect(spy).toHaveBeenCalled()
  })
  it('Bot.tweet() argument test', () => {

    const status = "Hello everyone";

    const spy = jest.spyOn(Bot._twit, 'post')
    Bot.tweet(status)

    expect(spy).toHaveBeenCalledWith('statuses/update', {
      status
    }, expect.any(Function))
  })

  it('Bot.tweet() should return correct value', async () => {

    const status = "Hello everyone";

    const response = Bot.tweet(status)

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('sendDirectMessage() should have been called properly', () => {

    const spy = jest.spyOn(Bot._twit, 'post')
    Bot.sendDirectMessage("12345678", "Hello everyone")
    expect(spy).toHaveBeenCalled()
  })

  it('sendDirectMessage() argument test', async () => {

    const message = "Hello, world";
    const userId = "12345678"
    const payload = {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: userId
          },
          message_data: {
            text: message
          }
        }
      }
    };


    const spy = jest.spyOn(Bot._twit, 'post')
    await Bot.sendDirectMessage(userId, message)

    expect(spy).toHaveBeenCalledWith('direct_messages/events/new', payload, expect.any(Function))
  })

  it('Bot.sendDirectMessage() should return correct value', async () => {

    const status = "Hello everyone";

    const response = Bot.sendDirectMessage("1234", 'hey')

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('Bot.getFollowers() should return correct value', async () => {
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));

    
    const response = Bot.getFollowers({
      user_id: "1234",
      auth:{}
    })

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });
  it('Bot.getAllFollowers() should return all followers', async () => {
   
    jest.spyOn(Bot, 'getFollowers').mockReturnValueOnce(Promise.resolve({
      ids: [1,2,3],
      next_cursor: 4
    })).mockReturnValueOnce(Promise.resolve({
      ids: [4, 5, 6],
      next_cursor: null
    }))

    
    const response = Bot.getAllFollowers({
      user_id: "1234",
      rateLimitPoint: 10,
      auth:{

      }, 
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual([1,2, 3, 4, 5, 6])
    expect(Bot.getFollowers).toBeCalledTimes(2)

  });
  it('Bot.getAllFollowers() delays when callCount', async () => {
    jest.spyOn(Bot, 'getFollowers').mockReturnValueOnce(Promise.resolve({
      ids: [1,2,3],
      next_cursor: 4
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: [4, 5, 6],
      next_cursor: 4
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: [7, 8, 9],
      next_cursor: null
    }))

    
    const response = Bot.getAllFollowers({
      user_id: "1234",
      auth:{

      }, 
      rateLimitPoint: 2,
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual([1,2, 3, 4, 5, 6, 7, 8, 9])
    expect(Bot.getFollowers).toBeCalledTimes(3)
    const _15minutes = 1000 * 60 * 15;
    expect(pause).toBeCalledTimes(1)
    expect(pause).toBeCalledWith(_15minutes)

  });
});