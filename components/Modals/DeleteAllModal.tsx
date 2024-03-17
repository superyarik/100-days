import { View } from 'react-native';
import { Portal, Modal, Text, Button } from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export function DeleteAllModal({
  visible,
  handleDeleteAll,
  handleClose,
}: {
  visible: boolean;
  handleDeleteAll: (data: any) => void;
  handleClose: () => void;
}) {
  const { t } = useTranslation();

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
        <View style={{ gap: 24 }}>
          <Text
            variant='headlineMedium'
            style={{ color: Colors.brand.charcoal }}
          >
            {t('youSureQuestion')}
          </Text>
          <Text variant='bodyLarge' style={{ color: Colors.brand.charcoal }}>
            {t('youSureWarningEverything')}
          </Text>
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
              mode='outlined'
              onPress={handleDeleteAll}
            >
              {t('yes')}
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
              mode='outlined'
              onPress={handleClose}
            >
              {t('no')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
