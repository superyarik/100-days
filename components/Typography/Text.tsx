import Colors from '@/constants/Colors';
import { Text as PaperText } from 'react-native-paper';

export function Text({
  children,
  color = Colors.brand.charcoal,
  ...rest
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <PaperText style={{ color }} {...rest}>
      {children}
    </PaperText>
  );
}
