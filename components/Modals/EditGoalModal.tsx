import { Platform, View } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Button,
  TextInput,
  Divider,
  Switch,
} from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useForm, Controller } from 'react-hook-form';
import { InputError } from '../Forms/InputError';
import { Goal } from '@/watermelon/models';
import { useCallback, useMemo, useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import {
  cancelScheduledNotificationAsync,
  scheduleNotificationAndGetID,
} from '@/services/notificationsService';
import { SelectList } from 'react-native-dropdown-select-list';
import { times } from '@/constants/times';
import { NotificationModal } from './NotificationModal';
import { withObservables } from '@nozbe/watermelondb/react';
import { Database } from '@nozbe/watermelondb';
import { useFocusEffect } from 'expo-router';
import {
  IosAuthorizationStatus,
  getPermissionsAsync,
} from 'expo-notifications';
import { useTranslation } from 'react-i18next';

function EditGoalModal({
  visible,
  goal,
  handleEditGoal,
  handleClose,
}: {
  visible: boolean;
  goal: Goal;
  handleEditGoal: (data: any) => void;
  handleClose: () => void;
}) {
  const database = useDatabase();
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      goalTitle: goal.title,
      goalDescription: goal.description || '',
    },
  });

  const [reminders, setReminders] = useState(Boolean(goal.notificationId));

  const [selectedTime, setSelectedTime] = useState(
    (goal.notificationHour ?? 9).toString()
  );

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     setReminders(Boolean(goal.notificationId));
  //   }, [goal.notificationId])
  // );

  const handleReminderChange = async (value: boolean) => {
    if (value === false) {
      await cancelScheduledNotificationAsync(goal.notificationId);
      await database.write(async () => {
        await goal.update((g: Goal) => {
          g.notificationId = '';
        });
      });
    } else {
      const res = await getPermissionsAsync();

      if (
        res.status !== 'granted' ||
        (Platform.OS === 'ios' &&
          (res.ios?.status === IosAuthorizationStatus.NOT_DETERMINED ||
            res.ios?.status === IosAuthorizationStatus.DENIED))
      ) {
        setIsNotificationModalVisible(true);
      } else {
        setReminders(value);
        await database.write(async () => {
          const notificationId = await scheduleNotificationAndGetID({
            goalName: goal.title,
          });
          await goal.update((g: Goal) => {
            g.notificationId = notificationId;
          });
        });
      }
    }
  };

  const handleTimeChange = async (value: string) => {
    // Cancel the old notification
    if (goal.notificationId) {
      await cancelScheduledNotificationAsync(goal.notificationId);
      await database.write(async () => {
        // Schedule a new notification
        const notificationId = await scheduleNotificationAndGetID({
          goalName: goal.title,
          hour: Number(value),
        });
        // Update the goal with the new notification ID and hour
        await goal.update((g: Goal) => {
          g.notificationId = notificationId;
          g.notificationHour = Number(value);
        });
      });
    }
    await database.write(async () => {
      await goal.update((g: Goal) => {
        g.notificationHour = Number(value);
      });
    });
    setSelectedTime(value);
  };

  const timeData: { key: string; value: string }[] = useMemo(() => {
    const data = times.map((time: Record<string, any>) => {
      return {
        value: `${time.displayHour}:00 ${time.amPm}`,
        key: time.hour.toString(),
      };
    });
    return data;
  }, [times]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={{
          backgroundColor: Colors.brand.cream,
          padding: 20,
          marginHorizontal: 20,
          borderRadius: 8,
        }}
      >
        <View style={{ position: 'relative', justifyContent: 'space-between' }}>
          <Text
            variant='titleLarge'
            style={{ color: Colors.brand.charcoal, fontWeight: '600' }}
          >
            {t('editGoalName', { title: goal.title })}
          </Text>
          <View style={{ gap: 4, marginVertical: 16 }}>
            <View>
              <Controller
                control={form.control}
                rules={{
                  required: {
                    value: true,
                    message: t('formValidation.titleRequired'),
                  },
                  max: {
                    value: 60,
                    message: t('formValidation.maxLength', { count: 60 }),
                  },
                }}
                name='goalTitle'
                render={({ field }) => (
                  <TextInput
                    onBlur={field.onBlur}
                    style={{ backgroundColor: Colors.brand.cream }}
                    textColor={Colors.brand.charcoal}
                    outlineStyle={{
                      borderWidth: 2,
                      borderColor: Colors.brand.charcoal,
                    }}
                    error={Boolean(form.formState.errors.goalTitle?.message)}
                    activeOutlineColor={Colors.brand.charcoal}
                    mode='outlined'
                    label={t('title')}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {form.formState.errors.goalTitle && (
                <InputError
                  message={
                    form.formState.errors.goalTitle.message ?? t('error')
                  }
                />
              )}
            </View>
            <View>
              <Controller
                control={form.control}
                rules={{ required: false }}
                name='goalDescription'
                render={({ field }) => (
                  <TextInput
                    mode='outlined'
                    multiline
                    numberOfLines={4}
                    returnKeyLabel='done'
                    returnKeyType='done'
                    label={t('description')}
                    onBlur={field.onBlur}
                    outlineStyle={{
                      borderWidth: 2,
                      borderColor: Colors.brand.charcoal,
                    }}
                    blurOnSubmit
                    value={field.value}
                    onChangeText={field.onChange}
                    activeOutlineColor={Colors.brand.charcoal}
                    error={Boolean(
                      form.formState.errors.goalDescription?.message
                    )}
                    textColor={Colors.brand.charcoal}
                    style={{
                      verticalAlign: 'top',
                      backgroundColor: Colors.brand.cream,
                      minHeight: 100,
                    }}
                  />
                )}
              />
              {form.formState.errors.goalDescription && (
                <InputError
                  message={
                    form.formState.errors.goalDescription.message ?? t('error')
                  }
                />
              )}
            </View>
          </View>
          <Divider />
          <View style={{ marginVertical: 10, gap: 5 }}>
            <Text style={{ fontWeight: '600' }}>{t('reminder_other')}:</Text>
            <View
              style={{ gap: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <Switch
                value={reminders}
                onValueChange={(value) => handleReminderChange(value)}
                color={Colors.brand.secondary}
              />
              <Text style={{ fontWeight: '600' }}>
                {reminders ? t('enabled') : t('disabled')}
              </Text>
            </View>
          </View>
          <View style={{ marginVertical: 10 }}>
            <SelectList
              maxHeight={150}
              defaultOption={
                goal.notificationId
                  ? {
                      key: selectedTime,
                      value:
                        Number(selectedTime) > 12
                          ? `${Number(selectedTime) - 12}:00 PM`
                          : `${Number(selectedTime)}:00 AM`,
                    }
                  : {
                      key: '9',
                      value: '9:00 AM',
                    }
              }
              search={false}
              save='key'
              setSelected={handleTimeChange}
              data={timeData}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              style={{
                borderColor: Colors.brand.charcoal,
                borderWidth: 2,
                borderRadius: 4,
                shadowColor: Colors.brand.charcoal,
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
              buttonColor={Colors.brand.primary}
              textColor={Colors.brand.charcoal}
              compact
              mode='outlined'
              onPress={form.handleSubmit(handleEditGoal)}
            >
              {t('update')}
            </Button>
            <Button
              textColor={Colors.brand.charcoal}
              buttonColor={Colors.brand.pictonBlue}
              style={{
                borderRadius: 4,
                borderWidth: 2,
                borderColor: Colors.brand.charcoal,
                shadowColor: Colors.brand.charcoal,
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
              compact
              mode='outlined'
              onPress={handleClose}
            >
              {t('close')}
            </Button>
          </View>
        </View>
        <NotificationModal
          visible={isNotificationModalVisible}
          handleClose={() => setIsNotificationModalVisible(false)}
        />
      </Modal>
    </Portal>
  );
}

const enhance = withObservables(
  [],
  ({ database, goalId }: { database: Database; goalId: string }) => ({
    goal: database.collections.get<Goal>('goals').findAndObserve(goalId),
  })
);

const EnhancedEditGoalModal = enhance(EditGoalModal);

export default EnhancedEditGoalModal;
