
const AppService = require('../helpers/AppService');
const Bot = require('../helpers/Bot');
const findUnfollowers = require('../helpers/findUnfollowers');
const humanizeArray = require('../helpers/humanizeArray');
const pause = require('../helpers/pause');
const randomItem = require('../helpers/randomItem');
const User = require('../models/user');

jest.mock('../helpers/randomItem');
jest.mock('../helpers/pause');
jest.mock('../models/user');
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
        humanizeArray.mockImplementation( () => '@israel')
        // @ts-ignore
        findUnfollowers.mockImplementation( () => ['1', "4"])
        
        const getAllFollowersMock = jest.fn(()=> Promise.resolve(['2', '3']));
        const getUsersMock = jest.fn(()=> Promise.resolve([
            {id: '1', name: 'Israel', username: 'israel'},
            {id: '2', name: 'FollowNotifyBot', username: 'FollowNotifyBot'}
        ]));

        const sendDirectMessageMock = jest.fn(()=> Promise.resolve("Response"));

        // @ts-ignore
        Bot.getAllFollowers = getAllFollowersMock;
        Bot.getUsers = getUsersMock;
        Bot.sendDirectMessage = sendDirectMessageMock;
        
        const userSaveMock = jest.fn();
        const user = {
            name: "MyName",
            followers: ["1", "2", "3", "4"],
            all_unfollows: ["4"],
            twitter_user_id: "twitter_id",
            access_token: "access token",
            access_token_secret: "access token secret",
            save: userSaveMock
        }

   
        await AppService.analyzeSubscriber({...user});

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
        });

        expect(humanizeArray).toHaveBeenCalledWith(["@israel"]);

        const message = "Hello MyName,\n@israel has unfollowed you!"
        expect(sendDirectMessageMock).toHaveBeenCalledWith(user.twitter_user_id, message)
    })

    

    it('analyzeSubscribersFollowers test', async () => {
        const users = [{_id: 1, save: () => {}}, {_id: 2, save: () => {}}, {_id: 3, save: () => {}}]
        // @ts-ignore
        User.find = jest.fn(() => {
            return {
                skip: jest.fn((skip) => {
                    return {
                        limit: jest.fn((limit) => {
                            return {
                                lt: jest.fn(() => {
                                    return Promise.resolve(users.slice(skip, skip + limit))
                                }),
                            }
                        }),
                    }
                })
            };
        });

        // @ts-ignore
        User.countDocuments = jest.fn(() => {
            return Promise.resolve(users.length)
        });

        jest.spyOn(AppService, 'analyzeSubscriber').mockReturnValueOnce(Promise.resolve())

        const runningTime = 1;

        jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(runningTime);

        await AppService.analyzeSubscribersFollowers()
        expect(AppService.analyzeSubscriber).toHaveBeenCalledTimes(3)
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith(expect.objectContaining({_id: 1}))
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith(expect.objectContaining({_id: 2}))
        expect(AppService.analyzeSubscriber).toHaveBeenCalledWith(expect.objectContaining({_id: 3}))

        expect(pause).toHaveBeenCalledTimes(1)
        const breakTime = 1000 * 60 * 60 * 2
        expect(pause).toHaveBeenCalledWith(breakTime - runningTime)

    });

    it('advertiseBot test', async () => {
        const keyword = "followers OR following";
        // @ts-ignore
        randomItem.mockReturnValueOnce(keyword).mockReturnValueOnce({id_str: "2", user: {screen_name: "israel"}})
      
        const searchTweetsMock = jest.fn(()=> Promise.resolve([{id_str: "1"}, {id_str: "2"}]));
        const tweetMock = jest.fn(()=> Promise.resolve({}));
        const uploadMediaMock = jest.fn((filePath)=> Promise.resolve({media_id_string: '125'}));
       
        // @ts-ignore
        Bot.searchTweets = searchTweetsMock;
        Bot.tweet = tweetMock;
        // @ts-ignore
        Bot.uploadMedia = uploadMediaMock;

        
        

   
        await AppService.advertiseBot()

        expect(randomItem).toBeCalledTimes(2)
        expect(searchTweetsMock).toBeCalledTimes(1)
        expect(searchTweetsMock).toHaveBeenCalledWith({
           count: 20,
           q:keyword
        })

        
        expect(tweetMock).toBeCalledTimes(1)

        const status = "I can help you monitor your unfollowers and notify you via DM when someone unfollows you. Click the link below to sign up:\nhttps://follownotifybot.xyz/";

        expect(tweetMock).toHaveBeenCalledWith({
            status,
            in_reply_to_status_id: "2", 
            media_ids: "125"
         })

       
    })

    it('followUserFollower test', async () => {
        

        const getUsersMock = jest.fn(()=> Promise.resolve([
            {id: '1', name: 'Israel', username: 'israel'}
        ]));

        const sendDirectMessageMock = jest.fn(()=> Promise.resolve("Response"));

        const userSaveMock = jest.fn();

        const userFollower = {
            name: "MyName",
            followers: ['1', '2', '3'],
            twitter_user_id: "twitter_id",
            access_token: "access token",
            access_token_secret: "access token secret",
            save: userSaveMock
        }

       
        // @ts-ignore
        User.find = jest.fn().mockResolvedValueOnce([userFollower]);

        // @ts-ignore
        randomItem.mockReturnValueOnce(userFollower).mockReturnValueOnce('5');

       
        
        // @ts-ignore
        User.findOne = jest.fn().mockResolvedValueOnce({followers: ["1", "5", "2"]});

        const followUserMock = jest.fn();

        // @ts-ignore
        
        Bot.getUsers = getUsersMock;
        Bot.sendDirectMessage = sendDirectMessageMock;
        Bot.followUser = followUserMock;
        

   
        await AppService.followUserFollower()

        expect(randomItem).toHaveBeenCalledTimes(2);
        expect(randomItem).toHaveBeenCalledWith([userFollower])
        expect(randomItem).toHaveBeenCalledWith(['3'])
        

        expect(User.find).toHaveBeenCalledTimes(1)
        expect(User.find).toHaveBeenCalledWith({username: { $ne: 'FollowNotifyBot' }});

        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({username: 'FollowNotifyBot'});

        expect(getUsersMock).toHaveBeenCalledWith({
            auth: {
                token: userFollower.access_token,
                token_secret: userFollower.access_token_secret
            }, 
            ids: ["5"]
        })

        const followBotTwitterId = "1256620641706561536";
        const message = "Automatic following: @israel"
        expect(sendDirectMessageMock).toHaveBeenCalledWith(followBotTwitterId, message)
    })

    it('getUsersByChunkSize test', async () => {
        const users = Array(100).fill(null).map((_, i) => (new User({id: i+1, name: `user${i+1}`})));
        // @ts-ignore
        User.find = jest.fn(() => {
            return {
                skip: jest.fn((skip) => {
                    return {
                        limit: jest.fn((limit) => {
                            return {
                                lt: jest.fn(() => {
                                    return Promise.resolve(users.slice(skip, skip + limit))
                                }),
                            }
                        }),
                    }
                })
            };
        });

        // @ts-ignore
        User.countDocuments = jest.fn(() => {
            return Promise.resolve(users.length)
        });
        const chunkSize = 10;
        const usersIterator = AppService.getUsersByChunkSize(chunkSize);
        let index = 0;

        for await(const user of usersIterator) {
            expect(user).toMatchObject(users[index]);
            index++;
        }


    });


});