import { FlatList, Platform } from 'react-native';
import EnhancedGoalCard from './GoalCard';
import { withObservables } from '@nozbe/watermelondb/react';
import type { Database, Model } from '@nozbe/watermelondb';

const GoalsList = ({
  goals,
  setIsDeleteGoalModalVisible,
  isDeleteGoalModalVisible,
}: {
  goals: Model[];
  setIsDeleteGoalModalVisible: (value: boolean) => void;
  isDeleteGoalModalVisible: boolean;
}) => {
  return (
    <FlatList
      style={{ marginBottom: Platform.OS === 'ios' ? 80 : 120 }}
      keyExtractor={(item) => item.id}
      data={goals}
      renderItem={({ item }) => (
        <EnhancedGoalCard
          setIsDeleteGoalModalVisible={setIsDeleteGoalModalVisible}
          isDeleteGoalModalVisible={isDeleteGoalModalVisible}
          goal={item}
        />
      )}
    />
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => {
  return {
    goals: database.get('goals').query(),
  };
});

const EnhancedGoalsList = enhance(GoalsList);

export default EnhancedGoalsList;
