
const AppService = require('../helpers/AppService');
const Bot = require('../helpers/Bot');
const findUnfollowers = require('../helpers/findUnfollowers');
const humanizeArray = require('../helpers/humanizeArray');
const pause = require('../helpers/pause');
const User = require('../models/user');

jest.mock('../helpers/pause');
jest.mock('../models/user', () => jest.fn());
jest.mock('../helpers/humanizeArray', () => jest.fn());
jest.mock('../helpers/findUnfollowers', () => jest.fn());
jest.mock('../helpers/Bot', () => jest.fn());
jest.mock("../config/logger", () => ({info: jest.fn(), error: jest.fn()}));

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

    

    it('analyzeSubscribersFollowers test', async () => {
        const users = [{_id: 1}, {_id: 2}, {_id: 3}]
        // @ts-ignore
        User.find = jest.fn(() => {
            return Promise.resolve(users)
        });
        jest.spyOn(AppService, 'analyzeSubscriber').mockReturnValueOnce(Promise.resolve())

        const runningTime = 1;

        jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(runningTime);

        await AppService.analyzeSubscribersFollowers()
        expect(AppService.analyzeSubscriber).toHaveBeenCalledTimes(3)
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith({_id: 1})
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith({_id: 2})
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith({_id: 3})

        expect(pause).toHaveBeenCalledTimes(1)
        const breakTime = 1000 * 60 * 60 * 2
        expect(pause).toHaveBeenCalledWith(breakTime - runningTime)

    });
});