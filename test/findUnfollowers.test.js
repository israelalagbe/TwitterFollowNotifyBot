const findUnfollowers = require("../helpers/findUnfollowers");

describe('find unfollowers', () => {
    it('should return unfollowers', () => {
        const prevFollowers = ['1', '2', '3'];
        const currentFollowers = ['1', '2'];
        const unfollowers = findUnfollowers(prevFollowers, currentFollowers)
        expect(unfollowers).toEqual(['3'])
    })

    it('should not return new followers as unfollowers', () => {
        const prevFollowers = [];
        const currentFollowers = ['1', '2', '4'];
        const unfollowers = findUnfollowers(prevFollowers, currentFollowers)
        expect(unfollowers).toEqual([])
    })
    it('should return correct unfollowers even when rearranged', () => {
        const prevFollowers = ['3', '2', '1'];
        const currentFollowers = ['1', '4', '2'];
        const unfollowers = findUnfollowers(prevFollowers, currentFollowers)
        expect(unfollowers).toEqual(['3'])
    })
});