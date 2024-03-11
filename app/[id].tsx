import { ProgressGrid } from '@/components/ProgressGrid';
import Colors from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, Portal } from 'react-native-paper';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AddProgressModal } from '@/components/Modals/AddProgressModal';
import { useDatabase } from '@/contexts/WaterMelonContext';
import { Goal, Progress } from '@/watermelon/models';
import { EditProgressModal } from '@/components/Modals/EditProgressModal';
import { DeleteGoalModal } from '@/components/Modals/DeleteGoalModal';
import EnhancedEditGoalModal from '@/components/Modals/EditGoalModal';

export default function Page() {
  const database = useDatabase();
  const { id, description } = useLocalSearchParams();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalProgress, setGoalProgress] = useState<Progress[]>([]);

  const [isFabGroupOpen, setIsFabGroupOpen] = useState(false);

  // We store the tapped cell number in this state
  const [activeCellNumber, setActiveCellNumber] = useState<number | null>(null);

  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);

  const [isEditGoalModalVisible, setIsEditGoalModalVisible] = useState(false);
  const [isDeleteGoalModalVisible, setIsDeleteGoalModalVisible] =
    useState(false);

  const handleDeleteGoal = async (goal: Goal) => {
    await database.write(async () => {
      await goal.destroyPermanently();
      await goal.progresses.destroyAllPermanently();
    });
    setIsDeleteGoalModalVisible(false);
    router.navigate('/');
  };

  const handleEditGoal = async ({
    data,
    goal,
  }: {
    data: Record<string, any>;
    goal: Goal;
  }) => {
    await database.write(async () => {
      await goal.update((goal) => {
        goal.title = data.goalTitle;
        goal.description = data.goalDescription || '';
      });
    });
    setIsEditGoalModalVisible(false);
  };

  const handleAddProgress = async ({
    description,
  }: {
    description: string;
  }) => {
    await database.write(async () => {
      await database.get('progresses').create((progress: Progress) => {
        progress.description = description;
        progress.goal.set(goal);
        progress.cellNumber = activeCellNumber;
        progress.lastLoggedAt = Date.now();
      });
    });
  };

  const handleEditProgress = async (data: Record<string, any>) => {
    await database.write(async () => {
      await editingProgress?.update((progress) => {
        progress.description = data.progressDescription || '';
      });
    });
    setEditingProgress(null);
  };

  const handleSubmitProgress = async (data: Record<string, any>) => {
    await handleAddProgress({ description: data.progressDescription });
    setActiveCellNumber(null);
  };

  useEffect(() => {
    // Find the goal by ID and observe changes
    const goalSubscription = database.collections
      .get('goals')
      .findAndObserve(id)
      .subscribe(setGoal);

    return () => goalSubscription.unsubscribe();
  }, [database, id]);

  useEffect(() => {
    if (goal) {
      const progressesSubscription = goal.progresses
        .observe()
        .subscribe(setGoalProgress);

      return () => progressesSubscription.unsubscribe();
    }
  }, [goal]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {!goal ? (
        <ActivityIndicator color={Colors.brand.quaternary} />
      ) : (
        <>
          <IconButton
            icon='arrow-left'
            style={{
              position: 'absolute',
              left: 16,
              top: 54,
            }}
            onPress={() => router.back()}
          />
          <Portal>
            <FAB.Group
              open={isFabGroupOpen}
              visible
              variant='secondary'
              fabStyle={styles.fab}
              style={{
                shadowColor: Colors.brand.charcoal,
                shadowOffset: { width: 2, height: 2 },
                shadowRadius: 0,
                shadowOpacity: 1,
              }}
              onStateChange={({ open }) => setIsFabGroupOpen(open)}
              actions={[
                {
                  icon: 'pencil',
                  label: 'Edit goal',
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => setIsEditGoalModalVisible(true),
                },
                {
                  icon: 'trash-can',
                  label: 'Delete goal',
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => setIsDeleteGoalModalVisible(true),
                },
                {
                  icon: 'arrow-left',
                  label: 'Back',
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => router.back(),
                },
              ]}
              color={Colors.brand.charcoal}
              icon='dots-horizontal'
              aria-label='Add a goal'
              rippleColor={Colors.brand.secondary}
            />
          </Portal>
          <ProgressGrid
            goal={goal}
            goalProgress={goalProgress}
            description={description}
            setSelectedCell={setActiveCellNumber}
            setEditingProgress={setEditingProgress}
          />
          <AddProgressModal
            visible={activeCellNumber !== null}
            handleSubmitProgress={handleSubmitProgress}
            handleClose={() => setActiveCellNumber(null)}
          />
          <EditProgressModal
            visible={editingProgress !== null}
            handleClose={() => setEditingProgress(null)}
            handleEditProgress={handleEditProgress}
            progress={editingProgress}
          />
          <DeleteGoalModal
            visible={isDeleteGoalModalVisible}
            handleDeleteGoal={() => handleDeleteGoal(goal)}
            handleClose={() => setIsDeleteGoalModalVisible(false)}
          />
          <EnhancedEditGoalModal
            database={database}
            visible={isEditGoalModalVisible}
            handleClose={() => setIsEditGoalModalVisible(false)}
            goalId={goal.id}
            handleEditGoal={async (data: Record<string, any>) =>
              await handleEditGoal({ data, goal })
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    shadowColor: Colors.brand.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    borderWidth: 2,
    shadowRadius: 0,
    borderColor: Colors.brand.charcoal,
    backgroundColor: Colors.brand.primary,
  },
});
