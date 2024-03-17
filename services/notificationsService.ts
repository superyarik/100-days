import * as Notifications from 'expo-notifications';

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
      title: 'Hey!',
      body: goalName
        ? `Did you complete ${goalName} today?`
        : 'Did you complete your goal today?',
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
