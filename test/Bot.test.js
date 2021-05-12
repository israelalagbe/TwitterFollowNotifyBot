const Twit = require('twit');
const Bot = require('../helpers/Bot');
const getPromiseCallback = require('../helpers/getPromiseCallback');

jest.mock('twit', () => class {
  post(_, __, callback) {
    callback(null, 'Response')
  }
  get(_, __, callback) {
    callback(null, 'Response')
  }

});

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
    }, expect.anything())
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

    expect(spy).toHaveBeenCalledWith('direct_messages/events/new', payload, expect.anything())
  })
  
  it('Bot.sendDirectMessage() should return correct value', async () => {

    const status = "Hello everyone";

    const response = Bot.sendDirectMessage("1234", 'hey')

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });

  it('Bot.getFollowers() should return correct value', async () => {

    const status = "Hello everyone";

    const response = Bot.getFollowers()

    expect(response).toBeInstanceOf(Promise)
    expect(await response).toBe("Response")

  });
});