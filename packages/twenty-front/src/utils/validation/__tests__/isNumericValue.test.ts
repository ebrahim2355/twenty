import { isNumericValue } from '~/utils/validation/isNumericValue';

describe('isNumericValue', () => {
  it('should detect single numbers', () => {
    expect(isNumericValue('0')).toBe(true);
    expect(isNumericValue('15')).toBe(true);
    expect(isNumericValue('05')).toBe(true);
  });

  it('should reject values that expand to several numbers', () => {
    expect(isNumericValue('*')).toBe(false);
    expect(isNumericValue('*/5')).toBe(false);
    expect(isNumericValue('1-5')).toBe(false);
    expect(isNumericValue('1,2,3')).toBe(false);
  });

  it('should reject non-numeric values', () => {
    expect(isNumericValue('')).toBe(false);
    expect(isNumericValue('invalid')).toBe(false);
  });
});
