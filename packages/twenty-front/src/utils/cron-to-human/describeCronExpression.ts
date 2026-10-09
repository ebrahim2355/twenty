import { t } from '@lingui/core/macro';
import { type Locale } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { isNumericValue } from '~/utils/validation/isNumericValue';

import { getDayOfMonthDescription } from './descriptors/getDayOfMonthDescription';
import { getDayOfWeekDescription } from './descriptors/getDayOfWeekDescription';
import { getHoursDescription } from './descriptors/getHoursDescription';
import { getMinutesDescription } from './descriptors/getMinutesDescription';
import { getMonthsDescription } from './descriptors/getMonthsDescription';
import {
  type CronDescriptionOptions,
  DEFAULT_CRON_DESCRIPTION_OPTIONS,
} from './types/CronDescriptionOptions';
import { parseCronExpression } from './utils/parseCronExpression';

export const describeCronExpression = (
  expression: string,
  options: CronDescriptionOptions = DEFAULT_CRON_DESCRIPTION_OPTIONS,
  localeCatalog?: Locale,
): string => {
  if (!isDefined(expression) || expression.trim() === '') {
    throw new Error('Cron expression is required');
  }

  try {
    const parts = parseCronExpression(expression);
    const mergedOptions = { ...DEFAULT_CRON_DESCRIPTION_OPTIONS, ...options };

    const descriptions: string[] = [];

    const hoursDescription = getHoursDescription(
      parts.hours,
      parts.minutes,
      mergedOptions,
    );
    const minutesDescription = getMinutesDescription(
      parts.minutes,
      mergedOptions,
    );

    if (!isNumericValue(parts.minutes)) {
      // Several minutes (e.g., "*/15", "0,30", "15-45") do not fit in the clock
      // time of the hours description, so they come first and the hours narrow them down
      if (isDefined(minutesDescription) && minutesDescription !== '') {
        descriptions.push(minutesDescription);
      }
      if (
        parts.hours !== '*' &&
        isDefined(hoursDescription) &&
        hoursDescription !== ''
      ) {
        descriptions.push(hoursDescription);
      }
    } else if (parts.hours === '*' && parts.minutes === '0') {
      // Pattern like "0 * * * *" - should be "every hour", not "at the top of the hour"
      descriptions.push(t`every hour`);
    } else if (isDefined(hoursDescription) && hoursDescription !== '') {
      descriptions.push(hoursDescription);
    } else if (isDefined(minutesDescription) && minutesDescription !== '') {
      descriptions.push(minutesDescription);
    }
    const dayOfMonthDesc = getDayOfMonthDescription(
      parts.dayOfMonth,
      mergedOptions,
    );
    const dayOfWeekDesc = getDayOfWeekDescription(
      parts.dayOfWeek,
      mergedOptions,
      localeCatalog,
    );

    if (
      isDefined(dayOfMonthDesc) &&
      dayOfMonthDesc !== '' &&
      parts.dayOfMonth !== '*'
    ) {
      descriptions.push(dayOfMonthDesc);
    } else if (
      isDefined(dayOfWeekDesc) &&
      dayOfWeekDesc !== '' &&
      parts.dayOfWeek !== '*'
    ) {
      descriptions.push(dayOfWeekDesc);
    }
    const monthsDesc = getMonthsDescription(
      parts.month,
      mergedOptions,
      localeCatalog,
    );
    if (isDefined(monthsDesc) && monthsDesc !== '') {
      descriptions.push(monthsDesc);
    }

    if (descriptions.length === 0) {
      return t`every minute`;
    }
    return descriptions.join(' ');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to describe cron expression: ${errorMessage}`);
  }
};
