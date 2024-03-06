import Colors from '@/constants/Colors';
import { useDatabase } from '@/contexts/WaterMelonContext';
import { Goal, Progress } from '@/watermelon/models';
import { withObservables } from '@nozbe/watermelondb/react';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { Platform, StyleSheet, View } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { DeleteGoalModal } from './Modals/DeleteGoalModal';
import EnhancedEditGoalModal from './Modals/EditGoalModal';

const GoalCard = ({
  goal,
  progresses,
  isDeleteGoalModalVisible,
  setIsDeleteGoalModalVisible,
}: {
  goal: Goal;
  progresses: Progress[];
  isDeleteGoalModalVisible: boolean;
  setIsDeleteGoalModalVisible: (visible: boolean) => void;
}) => {
  const database = useDatabase();

  const [isEditGoalModalVisible, setIsEditGoalModalVisible] = useState(false);

  const handleDeleteGoal = async () => {
    await database.write(async () => {
      await goal.destroyPermanently();
      await goal.progresses.destroyAllPermanently();
    });
    setIsDeleteGoalModalVisible(false);
  };

  const handleEditGoal = async (data: Record<string, any>) => {
    await database.write(async () => {
      await goal.update((goal) => {
        goal.title = data.goalTitle;
        goal.description = data.goalDescription || '';
      });
    });
    setIsEditGoalModalVisible(false);
  };

  const createdAt = useMemo(() => {
    const dateOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    // @ts-ignore
    return new Date(goal.createdAt).toLocaleDateString('en-US', dateOptions);
  }, [goal.createdAt]);

  return (
    <>
      <Card
        onPress={() =>
          router.navigate({
            pathname: `/${goal.id}`,
            params: { description: goal.description, goal },
          })
        }
        mode='contained'
        style={[styles.boxShadow, styles.outerCard]}
      >
        <Card.Title
          style={{ marginBottom: 8 }}
          titleVariant='headlineLarge'
          titleStyle={{ color: Colors.brand.charcoal, fontWeight: '600' }}
          title={goal.title}
          subtitleStyle={{ color: Colors.brand.charcoal }}
        />
        <Card.Content style={{ marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View style={[styles.boxShadow, styles.innerCard]}>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{ color: Colors.brand.charcoal, fontWeight: '800' }}
                >
                  Progress:
                </Text>
                <Text style={{ color: Colors.brand.charcoal }}>
                  {`${Math.floor((progresses.length / 100) * 100)} %`}
                </Text>
              </View>
            </View>
            <View style={[styles.boxShadow, styles.innerCard]}>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{ color: Colors.brand.charcoal, fontWeight: '800' }}
                >
                  Updated:
                </Text>
                <Text style={{ color: Colors.brand.charcoal }}>
                  {createdAt}
                </Text>
              </View>
            </View>
            <View style={[styles.boxShadow, styles.innerCard]}>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{ color: Colors.brand.charcoal, fontWeight: '800' }}
                >
                  Created:
                </Text>
                <Text style={{ color: Colors.brand.charcoal }}>
                  {createdAt}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <IconButton
            onPress={() => setIsEditGoalModalVisible(true)}
            mode='outlined'
            containerColor={Colors.brand.primary}
            style={{ borderWidth: 2, borderColor: Colors.brand.charcoal }}
            icon='pencil'
            iconColor={Colors.brand.charcoal}
          />
          <IconButton
            mode='outlined'
            containerColor={Colors.brand.primary}
            style={{ borderWidth: 2, borderColor: Colors.brand.charcoal }}
            animated
            onPress={() => setIsDeleteGoalModalVisible(true)}
            icon='delete'
            iconColor={Colors.brand.charcoal}
          />
        </Card.Actions>
      </Card>
      <DeleteGoalModal
        visible={isDeleteGoalModalVisible}
        handleDeleteGoal={handleDeleteGoal}
        handleClose={() => setIsDeleteGoalModalVisible(false)}
      />
      <EnhancedEditGoalModal
        database={database}
        visible={isEditGoalModalVisible}
        handleClose={() => setIsEditGoalModalVisible(false)}
        goalId={goal.id}
        handleEditGoal={handleEditGoal}
      />
    </>
  );
};

const enhance = withObservables(['goal'], ({ goal }) => ({
  goal,
  progresses: goal.progresses,
}));

const EnhancedGoalCard = enhance(GoalCard);

export default EnhancedGoalCard;

const styles = StyleSheet.create({
  outerCard: {
    borderWidth: 2,
    backgroundColor: Colors.brand.serenade,
    padding: 0,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  innerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.serenade,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
  },
  boxShadow: {
    shadowColor: Colors.brand.charcoal,
    shadowOffset: Platform.OS === 'ios' ? { width: 3, height: 3 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 0 : undefined,
  },
});
