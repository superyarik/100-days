import { Pressable, StyleSheet } from 'react-native';

export function ProgressSquare({
  disabled,
  color,
  borderColor,
  onPress,
  squareSize,
}: {
  onPress: () => void;
  disabled: boolean;
  color: string;
  borderColor: string;
  squareSize: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.square,
        {
          width: squareSize,
          height: squareSize,
          borderColor,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  square: {
    margin: 2,
    borderWidth: 2,
    borderRadius: 4,
  },
});
