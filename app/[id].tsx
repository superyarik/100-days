import { ProgressGrid } from '@/components/ProgressGrid';
import Colors from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ActivityIndicator, FAB, IconButton, Portal } from 'react-native-paper';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AddProgressModal } from '@/components/Modals/AddProgressModal';
import { useDatabase } from '@nozbe/watermelondb/react';
import { Goal, Progress } from '@/watermelon/models';
import { EditProgressModal } from '@/components/Modals/EditProgressModal';
import { DeleteGoalModal } from '@/components/Modals/DeleteGoalModal';
import EnhancedEditGoalModal from '@/components/Modals/EditGoalModal';
import {
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  scheduleNotificationAndGetID,
} from '@/services/notificationsService';
import { useTranslation } from 'react-i18next';
import { Model } from '@nozbe/watermelondb';
import { findHardModeFailure } from '@/lib/utils';

export default function Page() {
  const { t } = useTranslation();
  const database = useDatabase();
  const { id, description } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalProgress, setGoalProgress] = useState<Progress[]>([]);

  const [isFabGroupOpen, setIsFabGroupOpen] = useState(false);

  // We store the tapped cell number in this state
  const [activeCellNumber, setActiveCellNumber] = useState<number | null>(null);
  const [canDeleteEditingProgress, setCanDeleteEditingProgress] =
    useState(false);

  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);

  const [isEditGoalModalVisible, setIsEditGoalModalVisible] = useState(false);
  const [isDeleteGoalModalVisible, setIsDeleteGoalModalVisible] =
    useState(false);

  const handleDeleteGoal = async (goal: Goal) => {
    await database.write(async () => {
      const goalNotification = goal.notificationId;
      await cancelScheduledNotificationAsync(goalNotification);
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
    const oldTitle = goal.title;
    await database.write(async () => {
      await goal.update((goal) => {
        goal.title = data.goalTitle;
        goal.description = data.goalDescription || '';
      });
    });
    setIsEditGoalModalVisible(false);

    // If the user has granted permissions to send notifications and the goal title has changed
    if (Boolean(goal.notificationId) && data.goalTitle !== oldTitle) {
      // Check if the user has granted permissions to send notifications
      const canNotify: boolean = await requestPermissionsAsync();
      if (!canNotify) return;
      // Cancel the old alert
      await cancelScheduledNotificationAsync(goal.notificationId);
      // Schedule a new alert with the new goal title and the same hour
      const notificationId = await scheduleNotificationAndGetID({
        goalName: data.goalTitle,
        hour: goal.notificationHour,
      });
      // Update the goal with the new notification ID
      await database.write(async () => {
        await goal.update((g: Goal) => {
          g.notificationId = notificationId;
        });
      });
    }
  };

  const handleAddProgress = async ({
    description,
  }: {
    description: string;
  }) => {
    const todayDate = new Date().getTime();
    await database.write(async () => {
      await database.get('progresses').create((progress: Model) => {
        const myProgress = progress as Progress;
        myProgress.description = description;
        myProgress.goal.set(goal);
        myProgress.cellNumber = activeCellNumber;
        myProgress.lastLoggedAt = todayDate;
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

  const handleDeleteProgress = async () => {
    if (editingProgress && canDeleteEditingProgress) {
      await database.write(async () => {
        await editingProgress.destroyPermanently();
      });
    }
    setEditingProgress(null);
    setCanDeleteEditingProgress(false);
  };

  const clearGoalProgresses = async (progressList: Progress[]) => {
    database.write(async () => {
      await Promise.all(progressList.map((p) => p.destroyPermanently()));
    });
  };

  useEffect(() => {
    if (typeof id !== 'string') return;

    // Find the goal by ID and observe changes
    const goalSubscription = database.collections
      .get('goals')
      .findAndObserve(id)
      .subscribe((value: Model) => setGoal(value as Goal));

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

  useEffect(() => {
    const determineHardModeFailure = async () => {
      const hardModeFailed = await findHardModeFailure(goalProgress);

      if (hardModeFailed) {
        clearGoalProgresses(goalProgress);
      }

      setIsLoading(false);
    };
    determineHardModeFailure();
  }, [goalProgress]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      {!goal || isLoading ? (
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
                  label: t('editGoal'),
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => setIsEditGoalModalVisible(true),
                },
                {
                  icon: 'trash-can',
                  label: t('deleteGoal'),
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => setIsDeleteGoalModalVisible(true),
                },
                {
                  icon: 'arrow-left',
                  label: t('back'),
                  style: { backgroundColor: Colors.brand.primary },
                  onPress: () => router.back(),
                },
              ]}
              color={Colors.brand.charcoal}
              icon='dots-horizontal'
              aria-label={t('addAGoal')}
              rippleColor={Colors.brand.secondary}
            />
          </Portal>
          <ProgressGrid
            goal={goal}
            goalProgress={goalProgress}
            description={goal.description}
            setSelectedCell={setActiveCellNumber}
            setEditingProgress={setEditingProgress}
            setCanDeleteEditingProgress={setCanDeleteEditingProgress}
            clearProgress={clearGoalProgresses}
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
            canDeleteActive={canDeleteEditingProgress}
            handleDeleteProgress={handleDeleteProgress}
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
