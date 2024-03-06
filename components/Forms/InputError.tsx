import Colors from '@/constants/Colors';
import { Text } from 'react-native-paper';

export function InputError({ message }: { message: string }) {
  return (
    <Text
      style={{ marginTop: 4, color: Colors.brand.error, fontWeight: '600' }}
    >
      {message}
    </Text>
  );
}
