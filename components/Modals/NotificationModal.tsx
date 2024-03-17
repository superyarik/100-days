import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';

export function NotificationModal({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog
        style={{ borderRadius: 8, backgroundColor: Colors.brand.cream }}
        visible={visible}
        onDismiss={handleClose}
      >
        <Dialog.Title>{t('checkNotifications')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('notificationsDisabledWarning')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            mode='outlined'
            style={{
              borderRadius: 4,
              borderWidth: 2,
              borderColor: Colors.brand.charcoal,
              shadowColor: Colors.brand.charcoal,
              shadowOpacity: 1,
              shadowOffset: { width: 2, height: 2 },
              shadowRadius: 0,
            }}
            buttonColor={Colors.brand.primary}
            textColor={Colors.brand.charcoal}
            onPress={() => {
              Linking.openSettings();
              handleClose();
            }}
          >
            {t('setting_other')}
          </Button>
          <Button
            mode='outlined'
            style={{
              borderRadius: 4,
              borderWidth: 2,
              borderColor: Colors.brand.charcoal,
              shadowColor: Colors.brand.charcoal,
              shadowOpacity: 1,
              shadowOffset: { width: 2, height: 2 },
              shadowRadius: 0,
            }}
            buttonColor={Colors.brand.pictonBlue}
            textColor={Colors.brand.charcoal}
            onPress={handleClose}
          >
            {t('close')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
