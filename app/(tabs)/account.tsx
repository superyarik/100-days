import { DeleteAllModal } from '@/components/Modals/DeleteAllModal';
import { DisableNotificationsModal } from '@/components/Modals/DisableNotificationsModal';
import Colors from '@/constants/Colors';
import { useDatabase } from '@nozbe/watermelondb/react';
import { cancelAllScheduledNotificationsAsync } from '@/services/notificationsService';
import { Goal } from '@/watermelon/models';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text } from 'react-native-paper';

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const database = useDatabase();
  const [isDeleteAllModalVisible, setIsDeleteAllModalVisible] = useState(false);
  const [
    isDisableNotificationsModalVisible,
    setIsDisableNotificationsModalVisible,
  ] = useState(false);

  const [snackbarText, setSnackbarText] = useState('');
  const dismissSnackbar = () => {
    setSnackbarText('');
  };

  const handleDeleteAll = async () => {
    await database.write(async () => {
      await database.get('goals').query().destroyAllPermanently();
      await database.get('progresses').query().destroyAllPermanently();
    });
    setIsDeleteAllModalVisible(false);
    setSnackbarText(t('allGoalsDeleted'));
  };

  const handleDisableNotifications = async () => {
    await cancelAllScheduledNotificationsAsync();

    await database.write(async () => {
      const goals = await database.collections.get('goals').query().fetch();

      // Create an array of update operations
      const updates = goals.map((goal: Goal) =>
        goal.prepareUpdate((goal: Goal) => {
          goal.notificationId = ''; // Set notificationId to an empty string
        })
      );

      // Execute all updates in a single batch operation for efficiency
      await database.batch(...updates);
    });

    setSnackbarText(t('allNotificationsDisabled'));
    setIsDisableNotificationsModalVisible(false);
  };

  return (
    <View style={[styles.container, { gap: 16 }]}>
      <Button
        mode='outlined'
        buttonColor={Colors.brand.primary}
        textColor={Colors.brand.charcoal}
        style={{
          borderWidth: 2,
          borderColor: Colors.brand.charcoal,
          borderRadius: 4,
          shadowColor: Colors.brand.charcoal,
          shadowOpacity: 1,
          shadowOffset: { width: 3, height: 3 },
          shadowRadius: 0,
        }}
        onPress={() => setIsDeleteAllModalVisible(true)}
        icon='delete'
      >
        {t('deleteAllData')}
      </Button>
      <Button
        mode='outlined'
        buttonColor={Colors.brand.secondary}
        textColor={Colors.brand.cream}
        style={{
          borderWidth: 2,
          borderColor: Colors.brand.charcoal,
          borderRadius: 4,
          shadowColor: Colors.brand.charcoal,
          shadowOpacity: 1,
          shadowOffset: { width: 3, height: 3 },
          shadowRadius: 0,
        }}
        onPress={() => setIsDisableNotificationsModalVisible(true)}
        icon='bell'
      >
        {t('disableAllNotifications')}
      </Button>
      <Button
        mode='outlined'
        buttonColor={Colors.brand.tertiary}
        textColor={Colors.brand.cream}
        style={{
          borderWidth: 2,
          borderColor: Colors.brand.charcoal,
          borderRadius: 4,
          shadowColor: Colors.brand.charcoal,
          shadowOpacity: 1,
          shadowOffset: { width: 3, height: 3 },
          shadowRadius: 0,
        }}
        onPress={() => setIsDisableNotificationsModalVisible(true)}
        icon='bell'
      >
        {t('language_one')}
      </Button>
      <DeleteAllModal
        visible={isDeleteAllModalVisible}
        handleClose={() => setIsDeleteAllModalVisible(false)}
        handleDeleteAll={handleDeleteAll}
      />
      <DisableNotificationsModal
        visible={isDisableNotificationsModalVisible}
        handleClose={() => setIsDisableNotificationsModalVisible(false)}
        handleDisableNotifications={handleDisableNotifications}
      />
      <Snackbar
        style={{
          marginBottom: Platform.OS === 'ios' ? 80 : 120,
          backgroundColor: Colors.brand.quinary,
          borderColor: Colors.brand.charcoal,
          borderWidth: 2,
        }}
        visible={Boolean(snackbarText)}
        onDismiss={dismissSnackbar}
      >
        <Text style={{ color: Colors.brand.charcoal, fontWeight: '600' }}>
          {snackbarText}
        </Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
