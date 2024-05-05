import { Progress } from '@/watermelon/models';

/**
 * Find out whether a user has failed to log a progress for more than a day
 * @param progresses - Array of progresses
 * @returns whether the user has failed to log a progress for more than a day
 */
export const findHardModeFailure = (
  progresses: Progress[]
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      if (!progresses || progresses.length === 0) {
        resolve(false);
        return;
      }

      const lastProgress = progresses[progresses.length - 1];
      const lastProgressDate = new Date(lastProgress.lastLoggedAt);
      const now = new Date();

      // Calculate the difference in time in milliseconds
      const timeDiff = now.getTime() - lastProgressDate.getTime();

      // Convert time difference from milliseconds to days
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // Check if the difference is greater than 1 day
      resolve(daysDiff > 1);
    } catch (error) {
      reject(error);
    }
  });
};
