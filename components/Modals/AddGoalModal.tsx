import { View } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Button,
  TextInput,
  Switch,
} from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useForm, Controller } from 'react-hook-form';
import { InputError } from '../Forms/InputError';
import { useTranslation } from 'react-i18next';

export function AddGoalModal({
  visible,
  handleAddGoal,
  handleClose,
}: {
  visible: boolean;
  handleAddGoal: (data: {
    goalTitle: string;
    goalDescription: string;
    hardMode: boolean;
  }) => void;
  handleClose: () => void;
}) {
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      goalTitle: '',
      goalDescription: '',
      hardMode: false,
    },
  });

  const onSubmit = (data: {
    goalTitle: string;
    goalDescription: string;
    hardMode: boolean;
  }) => {
    handleAddGoal(data);
    form.reset({
      goalTitle: '',
      goalDescription: '',
      hardMode: false,
    });
  };

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
            {t('createGoal')}
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
                    form.formState.errors.goalDescription.message ?? 'Error'
                  }
                />
              )}
            </View>
          </View>
          <View>
            <View
              style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Controller
                control={form.control}
                name='hardMode'
                rules={{ required: false }}
                render={({ field }) => (
                  <Switch
                    disabled={form.formState.isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Text style={{ color: Colors.brand.charcoal }}>
                {t('hardMode')} ({t('hardModeDescription')})
              </Text>
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
                onPress={form.handleSubmit(onSubmit)}
              >
                {t('create')}
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
        </View>
      </Modal>
    </Portal>
  );
}
