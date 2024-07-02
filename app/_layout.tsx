import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as Notifications from 'expo-notifications';

import {
  PaperProvider,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';
import {
  getScheduledNotificationsAsync,
  requestPermissionsAsync,
} from '@/services/notificationsService';
import i18n from 'i18next';
import * as Localization from 'expo-localization';

import { AppState, Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import { Goal, Progress } from '@/watermelon/models';
import { schema } from '@/watermelon/schemas';
import migrations from '@/watermelon/migrations';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { I18nProvider } from '@/contexts/I18nContext';

import { initializeI18n } from '@/lib/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: Platform.OS === 'ios',
});

const database = new Database({
  adapter,
  modelClasses: [Goal, Progress],
});

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
  const [_notification, setNotification] = useState<any>();
  const [language, setLanguage] = useState<string | null>();
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [adsLoaded, setAdsLoaded] = useState(true);

  const [_pushAllowed, setPushAllowed] = useState(false);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/Lexend.ttf'),
    ...FontAwesome.font,
  });

  // AppState subscription
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Any time the app state changes, get the new locale and set it.
    const _handleAppStateChange = async () => {
      const storedLocale = await AsyncStorage.getItem('hundred_locale');
      i18n.changeLanguage(
        storedLocale
          ? storedLocale
          : Localization.getLocales()?.[0]?.languageTag ?? 'en-US'
      );
    };

    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!!goals?.length) return;

    const fetchGoals = async () => {
      const goals = await database.collections.get('goals').query().fetch();
      // @ts-ignore
      setGoals(goals);
    };

    fetchGoals();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!language || languageLoaded) return;
    const initI18n = async () => {
      await initializeI18n(language);
      setLanguageLoaded(true);
    };

    initI18n();
  }, [language, languageLoaded]);

  useEffect(() => {
    const getStoredLanguageAndSet = async () => {
      const storedLocale = await AsyncStorage.getItem('hundred_locale');
      const phoneLocale =
        Localization.getLocales()?.[0]?.languageTag ?? 'en-US';
      setLanguage(storedLocale ? storedLocale : phoneLocale);
    };

    getStoredLanguageAndSet();

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
    const setupNotifications = async () => {
      const scheduledNotifications = await getScheduledNotificationsAsync();

      if (scheduledNotifications.length > 0) {
        if (!!goals?.length) {
          // Get the scheduled notification ids
          const scheduledIds = scheduledNotifications.map(
            (notification) => notification.identifier
          );
          // Get the goal notification ids
          const goalIds = goals.map((goal: Goal) => goal.notificationId);
          // Ids that we need to cancel - not in the goals array
          const toCancel = scheduledIds.filter((id) => !goalIds.includes(id));

          // Cancel the notifications that need to be canceled
          if (toCancel.length > 0) {
            for (const notification of toCancel) {
              await Notifications.cancelScheduledNotificationAsync(
                notification
              );
            }
          }
        }
        return;
      }
    };

    setupNotifications();
  }, [goals]);

  const handleLayout = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, [loaded, languageLoaded]);

  useEffect(() => {
    if (loaded && languageLoaded && adsLoaded) {
      setTimeout(handleLayout, 1000);
    }
  }, [loaded, languageLoaded, adsLoaded]);

  if (!loaded || !languageLoaded || !adsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <DatabaseProvider database={database}>
      <I18nProvider>
        <PaperProvider theme={DefaultTheme}>
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen
              name='[id]'
              options={{ presentation: 'containedModal', headerShown: false }}
            />
            <Stack.Screen
              name='language'
              options={{ presentation: 'containedModal', headerShown: false }}
            />
          </Stack>
        </PaperProvider>
      </I18nProvider>
    </DatabaseProvider>
  );
}
