import { ProgressGrid } from '@/components/ProgressGrid';
import Colors from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AddProgressModal } from '@/components/Modals/AddProgressModal';
import { useDatabase } from '@/contexts/WaterMelonContext';
import { Goal, Progress } from '@/watermelon/models';
import { EditProgressModal } from '@/components/Modals/EditProgressModal';
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from 'react-native-gesture-handler';

export default function Page() {
  const database = useDatabase();
  const { id, description } = useLocalSearchParams();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalProgress, setGoalProgress] = useState<Progress[]>([]);

  // We store the tapped cell number in this state
  const [activeCellNumber, setActiveCellNumber] = useState<number | null>(null);

  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);

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
    <SafeAreaView style={styles.container}>
      <FAB
        mode='flat'
        style={[styles.fab, { zIndex: 10 }]}
        color={Colors.brand.charcoal}
        icon='arrow-left'
        size='medium'
        aria-label='Add a goal'
        onPress={() => router.back()}
        rippleColor={Colors.brand.secondary}
      />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    borderColor: Colors.brand.charcoal,
    backgroundColor: Colors.brand.primary,
    position: 'absolute',
    top: 56,
    left: 16,
  },
});
