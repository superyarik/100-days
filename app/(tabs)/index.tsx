import { StatusBar, StyleSheet } from 'react-native';

import { FAB } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/react';
import EnhancedGoalsList from '@/components/GoalsList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { AddGoalModal } from '@/components/Modals/AddGoalModal';
import Colors from '@/constants/Colors';
import { scheduleNotificationAndGetID } from '@/services/notificationsService';
import useObserveGoals from '@/hooks/useObserveGoals';
import { useTranslation } from 'react-i18next';
import { Goal } from '@/watermelon/models';

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

  const toggleAddGoalModal = () => {
    setAddGoalModalVisible(!addGoalModalVisible);
  };

  const handleAddItem = async ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    await database.write(async () => {
      const notificationId = await scheduleNotificationAndGetID({
        goalName: title,
      });
      await database.get('goals').create((goal: Goal) => {
        goal.title = title;
        goal.description = description;
        goal.status = 'active';
        goal.notificationId = notificationId;
        goal.notificationHour = 9;
      });
    });
  };

  const handleAddGoal = async (data: Record<string, string>) => {
    setAddGoalModalVisible(false);
    handleAddItem({ title: data.goalTitle, description: data.goalDescription });
  };

  const noGoals = useMemo(() => {
    return !goals || !goals?.length;
  }, [goals]);
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
