import { sum } from './index';

describe('Test sum function', function() {
    it('check correct case', () => {
        expect(sum(2, 2)).toEqual(4);
    });
});
