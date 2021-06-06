
const AppService = require('../helpers/AppService');
const Bot = require('../helpers/Bot');
const findUnfollowers = require('../helpers/findUnfollowers');
const humanizeArray = require('../helpers/humanizeArray');
const user = require('../models/user');

jest.mock('../helpers/humanizeArray', () => jest.fn());
jest.mock('../helpers/findUnfollowers', () => jest.fn());
jest.mock('../helpers/Bot', () => jest.fn());
jest.mock("../config/logger", () => ({info: jest.fn()}));

describe('AppService Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        jest.restoreAllMocks()
      });

    it('analyzeSubscriber test', async () => {
        

        // @ts-ignore
        humanizeArray.mockImplementation( () => ['@israel'])
        // @ts-ignore
        findUnfollowers.mockImplementation( () => ['1'])
        
        const getAllFollowersMock = jest.fn(()=> Promise.resolve(['2', '3']));
        const getUsersMock = jest.fn(()=> Promise.resolve([
            {id: '1', name: 'Israel', username: 'israel'}
        ]));

        const sendDirectMessageMock = jest.fn(()=> Promise.resolve("Response"));

        // @ts-ignore
        Bot.getAllFollowers = getAllFollowersMock;
        Bot.getUsers = getUsersMock;
        Bot.sendDirectMessage = sendDirectMessageMock;
        
        const userSaveMock = jest.fn();
        const user = {
            name: "MyName",
            followers: ["1", "2", "3"],
            twitter_user_id: "twitter_id",
            access_token: "access token",
            access_token_secret: "access token secret",
            save: userSaveMock
        }

   
        await AppService.analyzeSubscriber({...user})

        expect(getAllFollowersMock).toHaveBeenCalledWith({
            user_id: user.twitter_user_id,
            chunkSize: 5000,
            rateLimitPoint: 10,
            auth: {
                token: user.access_token,
                token_secret: user.access_token_secret
            }
        })

        const newFollowers = ['2', '3'];
        expect(findUnfollowers).toHaveBeenCalledWith(user.followers, newFollowers)

        expect(getUsersMock).toHaveBeenCalledWith({
            auth: {
                token: user.access_token,
                token_secret: user.access_token_secret
            }, 
            ids: ["1"]
        })

        const message = "Hello MyName,\n@israel has unfollowed you!"
        expect(sendDirectMessageMock).toHaveBeenCalledWith(user.twitter_user_id, message)
    })

    it('analyzeSubscriber test', async () => {
        jest.spyOn(Bot, 'getFollowers').mockReturnValueOnce(Promise.resolve({
            ids: ['1', '2', '3'],
            next_cursor_str: '4'
          }))
    })

    
});