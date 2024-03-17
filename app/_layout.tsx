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
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '@/services/i18n/en-US.json';
import pt from '@/services/i18n/pt.json';
import { AppState, Platform } from 'react-native';

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
  const [language, setLanguage] = useState<string | null>();
  const [languageLoaded, setLanguageLoaded] = useState(false);

  const resources = {
    en,
    pt,
  };

  const [pushAllowed, setPushAllowed] = useState(false);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/Lexend.ttf'),
    ...FontAwesome.font,
  });

  // AppState subscription
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Any time the app state changes, get the new locale and set it.
    const _handleAppStateChange = () => {
      setLanguage(Localization.getLocales()?.[0]?.languageTag ?? 'en-US');
    };

    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

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
    if (languageLoaded && loaded) {
      SplashScreen.hideAsync();
    }
  }, [languageLoaded, loaded]);

  useEffect(() => {
    if (!language) return;
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources,
      lng: language ?? 'en-US',
      fallbackLng: 'en-US',
    });
    setLanguageLoaded(true);
  }, [language]);

  useEffect(() => {
    const phoneLanguage =
      Localization.getLocales()?.[0]?.languageTag ?? 'en-US';
    setLanguage(phoneLanguage);

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

  if (!loaded || !languageLoaded) {
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
