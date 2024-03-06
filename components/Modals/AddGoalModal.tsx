import { View } from 'react-native';
import { Portal, Modal, Text, Button, TextInput } from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useForm, Controller } from 'react-hook-form';
import { InputError } from '../Forms/InputError';

export function AddGoalModal({
  visible,
  handleAddGoal,
  handleClose,
}: {
  visible: boolean;
  handleAddGoal: (data: Record<string, any>) => void;
  handleClose: () => void;
}) {
  const form = useForm({
    defaultValues: {
      goalTitle: '',
      goalDescription: '',
    },
  });

  const onSubmit = (data: Record<string, any>) => {
    handleAddGoal(data);
    form.reset({
      goalTitle: '',
      goalDescription: '',
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
            Create Goal
          </Text>
          <View style={{ gap: 4, marginVertical: 16 }}>
            <View>
              <Controller
                control={form.control}
                rules={{
                  required: { value: true, message: 'Title is required' },
                  max: { value: 60, message: 'Max length is 60 characters' },
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
                    label='Title'
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              {form.formState.errors.goalTitle && (
                <InputError
                  message={form.formState.errors.goalTitle.message ?? 'Error'}
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
                    label={'Description'}
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
              Create
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
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
