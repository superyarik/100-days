import { Platform, StatusBar, StyleSheet } from 'react-native';

import { FAB } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/react';
import EnhancedGoalsList from '@/components/GoalsList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import { AddGoalModal } from '@/components/Modals/AddGoalModal';
import Colors from '@/constants/Colors';
import { scheduleNotificationAndGetID } from '@/services/notificationsService';
import useObserveGoals from '@/hooks/useObserveGoals';
import { useTranslation } from 'react-i18next';
import { Goal } from '@/watermelon/models';
import { Model } from '@nozbe/watermelondb';
import {
  useTrackingPermissions,
  PermissionStatus,
} from 'expo-tracking-transparency';

export default function HomeScreen() {
  const { t } = useTranslation();
  const database = useDatabase();

  const goalsObservable = useMemo(() => {
    return database.collections.get('goals').query();
  }, []);

  const goals = useObserveGoals(goalsObservable);

  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  const [isDeleteGoalModalVisible, setIsDeleteGoalModalVisible] =
    useState(false);

  const [status, requestPermission] = useTrackingPermissions();

  const toggleAddGoalModal = () => {
    setAddGoalModalVisible(!addGoalModalVisible);
  };

  useEffect(() => {
    if (
      status?.status === PermissionStatus.UNDETERMINED &&
      status?.canAskAgain
    ) {
      requestPermission();
    }
  }, [status]);

  const handleAddItem = async ({
    title,
    description,
    hardMode,
  }: {
    title: string;
    description: string;
    hardMode: boolean;
  }) => {
    await database.write(async () => {
      const notificationId = await scheduleNotificationAndGetID({
        goalName: title,
      });
      await database.get('goals').create((goal: Model) => {
        (goal as Goal).title = title;
        (goal as Goal).description = description;
        (goal as Goal).status = 'active';
        (goal as Goal).notificationId = notificationId;
        (goal as Goal).notificationHour = 9;
        (goal as Goal).hardMode = hardMode;
      });
    });
  };

  const handleAddGoal = async (data: {
    goalTitle: string;
    goalDescription: string;
    hardMode: boolean;
  }) => {
    setAddGoalModalVisible(false);
    handleAddItem({
      title: data.goalTitle,
      description: data.goalDescription,
      hardMode: data.hardMode,
    });
  };

  const noGoals = useMemo(() => {
    return !goals || !goals?.length;
  }, [goals]);

  if (status === null) {
    return null;
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          justifyContent: noGoals ? 'center' : undefined,
          alignItems: noGoals ? 'center' : undefined,
        },
      ]}
    >
      {noGoals ? (
        <FAB
          icon='plus'
          size='large'
          mode='flat'
          style={styles.firstItemButton}
          rippleColor={Colors.brand.secondary}
          onPress={toggleAddGoalModal}
        />
      ) : (
        <>
          <EnhancedGoalsList
            database={database}
            setIsDeleteGoalModalVisible={setIsDeleteGoalModalVisible}
            isDeleteGoalModalVisible={isDeleteGoalModalVisible}
          />
          <FAB
            mode='flat'
            style={styles.fab}
            color={Colors.brand.charcoal}
            icon='plus'
            aria-label={t('addGoal')}
            onPress={toggleAddGoalModal}
            rippleColor={Colors.brand.secondary}
          />
        </>
      )}
      <AddGoalModal
        visible={addGoalModalVisible}
        handleAddGoal={handleAddGoal}
        handleClose={() => setAddGoalModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.cream,
    position: 'relative',
    flex: 1,
    height: StatusBar.currentHeight || 0,
  },
  fab: {
    shadowColor: Colors.brand.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    borderWidth: 2,
    borderColor: Colors.brand.charcoal,
    backgroundColor: Colors.brand.primary,
    position: 'absolute',
    bottom: 36,
    right: 16,
  },
  firstItemButton: {
    borderColor: Colors.brand.charcoal,
    borderWidth: 2,
    backgroundColor: Colors.brand.primary,
    shadowColor: Colors.brand.charcoal,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
  },
});
