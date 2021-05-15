const request = require('request');
const http = require('../helpers/http');


jest.mock('request');




describe('HTTP Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        jest.restoreAllMocks()
    });
    it('Should call request with correct parameters, and return correct response', async () => {



        // @ts-ignore
        request.post.mockImplementation((url, config, callback) => {
            callback(null, {
                statusCode: 200
            }, `{"status":"success"}`)
        })
        // request.post
        const response = await http('google.com', {
            method: 'post',
            params: {
                hello: 'world'
            },
            body: {
                a: 'b'
            },
            oauth: {
                token: "to"
            }
        });

        expect(request.post).toHaveBeenCalledWith('google.com?hello=world', {
            timeout: 60000,
            oauth: {
                token: "to"
            },
            json: true,
            body: {
                a: 'b'
            }
        }, expect.any(Function))
        expect(response).toEqual({status:'success'})

    })
});