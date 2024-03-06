import Colors from '@/constants/Colors';
import { Linking } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';

export function NotificationModal({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: () => void;
}) {
  return (
    <Portal>
      <Dialog
        style={{ borderRadius: 8, backgroundColor: Colors.brand.cream }}
        visible={visible}
        onDismiss={handleClose}
      >
        <Dialog.Title>Check Notifications</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>
            Your notifications settings are disabled for this app. Check your
            settings to enable notifications.
          </Text>
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
            Settings
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
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
