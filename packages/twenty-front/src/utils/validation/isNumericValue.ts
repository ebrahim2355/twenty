import { isDefined } from 'twenty-shared/utils';

export const isNumericValue = (value: string): boolean => {
  return isDefined(value) && /^\d+$/.test(value);
};
