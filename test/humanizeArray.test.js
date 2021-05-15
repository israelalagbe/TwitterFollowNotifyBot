const humanizeArray = require("../helpers/humanizeArray");

describe('Humanize Array', () => {

    it('should return correct string', () => {
        const value = humanizeArray(["@israel", '@steven', '@samson'])
        expect(value).toBe("@israel, @steven and @samson")
    })

    it('should handle 2 items properly', () => {
        const value = humanizeArray(["@israel", '@steven'])
      expect(value).toBe("@israel and @steven")
    })

    it('should handle 1 item properly', () => {
        const value = humanizeArray(["@israel"])
        expect(value).toBe("@israel")
    })
});