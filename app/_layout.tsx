import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';

import * as Notifications from 'expo-notifications';

import { DatabaseProvider } from '@/contexts/WaterMelonContext';
import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';
import {
  getScheduledNotificationsAsync,
  requestPermissionsAsync,
} from '@/services/notificationsService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription>();
  const [notification, setNotification] = useState<any>();

  const [pushAllowed, setPushAllowed] = useState(false);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/Lexend.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const requestNotificationsPerms = async () => {
      await requestPermissionsAsync().then((result) => {
        setPushAllowed(result);
      });
    };

    requestNotificationsPerms().then(() => {
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) =>
          setNotification(notification)
        );
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!pushAllowed) return;

    const setupNotifications = async () => {
      const scheduledNotifications = await getScheduledNotificationsAsync();

      if (scheduledNotifications.length > 0) {
        return;
      }
    };

    setupNotifications();
  }, [pushAllowed]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <DatabaseProvider>
      <PaperProvider theme={DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen
            name='[id]'
            options={{ presentation: 'containedModal', headerShown: false }}
          />
        </Stack>
      </PaperProvider>
    </DatabaseProvider>
  );
}
