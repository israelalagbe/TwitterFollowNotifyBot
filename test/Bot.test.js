const Twit = require('twit');
const Bot = require('../helpers/bot');
// @ts-ignore
const getPromiseCallback = require('../helpers/getPromiseCallback');
const http = require('../helpers/http');
const pause = require('../helpers/pause');


// jest.mock('twit', () => class {
  // post(_, __, callback) {
  //   callback(null, 'Response')
  // }
//   get(_, __, callback) {
//     callback(null, 'Response')
//   }

// });

jest.mock('twit');


jest.mock('../helpers/RateLimiters', () => ({
  limitFollowersCall(){
    return Promise.resolve("yes")
  }

}))

jest.mock('../helpers/http');
jest.mock('../helpers/pause');

const config = {
  consumer_key: 'consumerkey',
  consumer_secret: 'consumer secret',
  access_token: 'access token',
  access_token_secret: 'access token secret',
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
}


describe('Bot Test', () => {
  // const twit = new Twit(config)

  // @ts-ignore
  const postFn = jest.fn((_, __, callback)=> callback(null, 'Response'))
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
    // @ts-ignore
  
    
  });

  it('tweet() should have been called properly', async () => {
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));
    
    const twit = new Twit(config)
    

    await Bot.tweet({status:"Hello everyone" })
    expect(http).toHaveBeenCalledTimes(1)
  })
  it('Bot.tweet() argument test', async () => {
    
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));
    

    const status = "Hello everyone";
    const in_reply_to_status_id = "1234"
    // @ts-ignore
   
    await Bot.tweet({status, in_reply_to_status_id: "1234"})

    expect(http).toHaveBeenCalledWith('https://api.twitter.com/1.1/statuses/update.json', {
      body: {
        status,
        in_reply_to_status_id,
        auto_populate_reply_metadata: true
      },
      method: 'post',
      oauth: expect.any(Object)
    })
  })

  it('Bot.tweet() should return correct value', async () => {

    
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));

    const status = "Hello everyone";

    const response = Bot.tweet({status})

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('sendDirectMessage() should have been called properly', () => {

    const postFn = jest.fn((_, __, callback)=> callback(null, 'Response'))
    // @ts-ignore
    Twit.mockImplementation( () => {
      return {
        post: postFn,
      };
    });

 
    Bot.sendDirectMessage("12345678", "Hello everyone")

    expect(postFn).toHaveBeenCalled()
  })

  it('sendDirectMessage() argument test', async () => {

     const postFn = jest.fn((_, __, callback)=> callback(null, 'Response'))
    // @ts-ignore
    Twit.mockImplementation( () => {
      return {
        post: postFn,
      };
    });
    

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


    
    await Bot.sendDirectMessage(userId, message)

    expect(postFn).toHaveBeenCalledWith('direct_messages/events/new', payload, expect.any(Function))
  })

  it('Bot.sendDirectMessage() should return correct value', async () => {

    const postFn = jest.fn((_, __, callback)=> callback(null, 'Response'))
    // @ts-ignore
    Twit.mockImplementation( () => {
      return {
        post: postFn,
      };
    });
    

    const twit = new Twit(config)
    
    
    // @ts-ignore
    const status = "Hello everyone";

    const response = Bot.sendDirectMessage("1234", 'hey')

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('Bot.getFollowing() should return correct value', async () => {
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));

    
    const response = Bot.getFollowing({
      user_id: "1234",
      auth:{}
    })

    expect(http).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('Bot.getAllFollowing() should return all followers', async () => {
   
    jest.spyOn(Bot, 'getFollowing').mockReturnValueOnce(Promise.resolve({
      ids: ['1', '2', '3'],
      next_cursor_str: '4'
    })).mockReturnValueOnce(Promise.resolve({
      ids: ['4', '5', '6'],
      next_cursor_str: null
    }))

    
    const response = Bot.getAllFollowing({
      user_id: "1234",
      rateLimitPoint: 10,
      auth:{

      }, 
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual(['1','2', '3', '4', '5', '6'])
    expect(Bot.getFollowing).toBeCalledTimes(2)

  });
  it('Bot.getAllFollowing() delays when callCount', async () => {
    jest.spyOn(Bot, 'getFollowing').mockReturnValueOnce(Promise.resolve({
      ids: ['1', '2', '3'],
      next_cursor_str: '4'
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: ['4', '5', '6'],
      next_cursor_str: '4'
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: ['7', '8', '9'],
      next_cursor_str: null
    }))

    
    const response = Bot.getAllFollowing({
      user_id: "1234",
      auth:{

      }, 
      rateLimitPoint: 2,
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(Bot.getFollowing).toBeCalledTimes(3)
    const _15minutes = 1000 * 60 * 15;
    expect(pause).toBeCalledTimes(1)
    expect(pause).toBeCalledWith(_15minutes)

  });

  it('Bot.getFollowers() should return correct value', async () => {
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve("Response"));

    
    const response = Bot.getFollowers({
      user_id: "1234",
      auth:{}
    })

    expect(http).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });
  it('Bot.getAllFollowers() should return all followers', async () => {
   
    jest.spyOn(Bot, 'getFollowers').mockReturnValueOnce(Promise.resolve({
      ids: ['1', '2', '3'],
      next_cursor_str: '4'
    })).mockReturnValueOnce(Promise.resolve({
      ids: ['4', '5', '6'],
      next_cursor_str: null
    }))

    
    const response = Bot.getAllFollowers({
      user_id: "1234",
      rateLimitPoint: 10,
      auth:{

      }, 
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual(['1','2', '3', '4', '5', '6'])
    expect(Bot.getFollowers).toBeCalledTimes(2)

  });
  it('Bot.getAllFollowers() delays when callCount', async () => {
    jest.spyOn(Bot, 'getFollowers').mockReturnValueOnce(Promise.resolve({
      ids: ['1', '2', '3'],
      next_cursor_str: '4'
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: ['4', '5', '6'],
      next_cursor_str: '4'
    }))
    .mockReturnValueOnce(Promise.resolve({
      ids: ['7', '8', '9'],
      next_cursor_str: null
    }))

    
    const response = Bot.getAllFollowers({
      user_id: "1234",
      auth:{

      }, 
      rateLimitPoint: 2,
      chunkSize: 4
    })

    

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(Bot.getFollowers).toBeCalledTimes(3)
    const _15minutes = 1000 * 60 * 15;
    expect(pause).toBeCalledTimes(1)
    expect(pause).toBeCalledWith(_15minutes)

  });

  it('Bot.searchTweets() should be called properly', async () => {
    // @ts-ignore
    http.mockImplementation(() => Promise.resolve({
      statuses: [{id_str: "2"}]
    }));

    
    const response = Bot.searchTweets({
      q: "keyword",
      count: 20
    })
    expect(http).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(Promise)
    expect(await response).toEqual([{id_str: "2"}])

  });
});