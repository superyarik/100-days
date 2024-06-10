import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Portal, Dialog, Text, Button } from 'react-native-paper';

export function FailedHardModeModal({
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
        <Dialog.Title>{t('missedADayTitle')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('missedADayContent')}</Text>
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
            buttonColor={Colors.brand.pictonBlue}
            textColor={Colors.brand.charcoal}
            onPress={handleClose}
          >
            {t('ok')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
