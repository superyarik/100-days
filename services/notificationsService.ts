import * as Notifications from 'expo-notifications';
import { i18n } from '@/lib/i18n';

const useTranslation = (translationKey, options = null) => {
  if (!i18n.isInitialized) {
    console.log("i18n не инициализирован");
    return;
  }

  return i18n.t(translationKey, options);
};

export async function requestPermissionsAsync(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }
  return true;
}

export async function scheduleNotification({
  goalName = '',
  hour = 9,
  minute = 0,
}: {
  goalName?: string;
  hour?: number;
  minute?: number;
}) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: useTranslation('hey'),
      body: goalName
        ? useTranslation('didYouCompleteGoalNameToday', { goalName })
        : useTranslation('didYouCompleteGoalToday'),
    },
    trigger: { hour, minute, repeats: true },
  });

  return notificationId;
}

export async function scheduleNotificationAndGetID({
  goalName,
  hour = 9,
  minute = 0,
}: {
  goalName: string;
  hour?: number;
  minute?: number;
}) {
  const notificationId = await scheduleNotification({ goalName, hour, minute });

  return notificationId;
}

export async function getScheduledNotificationsAsync() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  return scheduledNotifications;
}

export async function cancelScheduledNotificationAsync(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllScheduledNotificationsAsync() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
