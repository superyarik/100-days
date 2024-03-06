import { StatusBar, StyleSheet } from 'react-native';

import { FAB } from 'react-native-paper';
import { useDatabase } from '@/contexts/WaterMelonContext';
import EnhancedGoalsList from '@/components/GoalsList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AddGoalModal } from '@/components/Modals/AddGoalModal';
import Colors from '@/constants/Colors';
import { scheduleNotificationAndGetID } from '@/services/notificationsService';

export default function HomeScreen() {
  const database = useDatabase();

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
      await database.get('goals').create((goal: any) => {
        goal.title = title;
        goal.description = description;
        goal.status = 'active';
        goal.notificationId = notificationId;
        goal.notificationHour = 9;
      });
    });
  };

  const deleteAll = async () => {
    await database.write(async () => {
      await database.get('goals').query().destroyAllPermanently();
    });
  };

  const handleAddGoal = async (data: Record<string, string>) => {
    setAddGoalModalVisible(false);
    handleAddItem({ title: data.goalTitle, description: data.goalDescription });
  };

  return (
    <SafeAreaView style={styles.container}>
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
        aria-label='Add a goal'
        onPress={toggleAddGoalModal}
        rippleColor={Colors.brand.secondary}
      />
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
});
