import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';

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
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '@/services/i18n/en-US.json';
import pt from '@/services/i18n/pt.json';
import { AppState, Platform } from 'react-native';
import { Database, Model } from '@nozbe/watermelondb';
import { Goal, Progress } from '@/watermelon/models';
import { schema } from '@/watermelon/schemas';
import migrations from '@/watermelon/migrations';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { DatabaseProvider } from '@nozbe/watermelondb/react';

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
  const [notification, setNotification] = useState<any>();
  const [language, setLanguage] = useState<string | null>();
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

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

  useEffect(() => {
    if (!!goals?.length) return;

    const fetchGoals = async () => {
      const goals = await database.collections.get('goals').query().fetch();
      setGoals(goals);
    };

    fetchGoals();
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
      fallbackLng: 'en',
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

  if (!loaded || !languageLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <DatabaseProvider database={database}>
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
