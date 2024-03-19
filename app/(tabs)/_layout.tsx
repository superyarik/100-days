import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { usePathname } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import useObserveGoals from '@/hooks/useObserveGoals';
import { useTranslation } from 'react-i18next';
import { useDatabase } from '@nozbe/watermelondb/react';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
  const database = useDatabase();

  const goalsObservable = useMemo(() => {
    return database.collections.get('goals').query();
  }, []);

  const goals = useObserveGoals(goalsObservable);

  const emptyGoals = useMemo(() => {
    return Boolean(goals) && !goals.length;
  }, [goals]);

  const pathname = usePathname();

  const { t } = useTranslation();

  return (
    <View style={!goals ? styles.noGoals : styles.container}>
      {!goals ? (
        <ActivityIndicator size='large' color={Colors.brand.secondary} />
      ) : (
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.brand.secondary,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              zIndex: 8,
              width: pathname === '/account' || emptyGoals ? undefined : '75%',
              borderWidth: 2,
              borderRadius: 50,
              height: 70,
              marginBottom: 30,
              shadowColor: Colors.brand.charcoal,
              shadowOpacity: 1.0,
              shadowOffset: { width: 2, height: 2 },
              shadowRadius: 0,
              paddingBottom: 0,
              marginHorizontal: 16,
              backgroundColor: Colors.brand.cream,
              borderTopWidth: 2,
              borderColor: Colors.brand.charcoal,
              borderTopColor: Colors.brand.charcoal,
            },
            tabBarIconStyle: {
              marginTop: 10,
            },
            tabBarLabelStyle: {
              paddingBottom: 16,
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name='index'
            options={{
              title: t('goal_other'),
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name='check' color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name='account'
            options={{
              title: t('setting_other'),
              tabBarIcon: ({ color }) => (
                <TabBarIcon name='user' color={color} />
              ),
            }}
          />
        </Tabs>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.cream,
  },
  noGoals: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
