import Colors from '@/constants/Colors';
import { useDatabase } from '@/contexts/WaterMelonContext';
import { Goal, Progress } from '@/watermelon/models';
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export function ProgressGrid({
  goal,
  goalProgress,
  description,
  setSelectedCell,
  setEditingProgress,
}: {
  goal: Goal | null;
  goalProgress: Progress[];
  description: string | string[];
  setSelectedCell: (value: number) => void;
  setEditingProgress: (value: Progress) => void;
}) {
  const database = useDatabase();

  const [errorMessage, setErrorMessage] = useState('');

  const handleCellPress = async (
    cellNumber: number,
    cellCompleted: boolean = false
  ): Promise<void> => {
    setErrorMessage('');
    if (!cellCompleted) {
      setSelectedCell(cellNumber);
    } else {
      const progressToUpdate = goalProgress.find(
        (p: Progress) => p.cellNumber === cellNumber && p.goal.id === goal?.id
      );
      if (progressToUpdate) {
        setEditingProgress(progressToUpdate);
      } else {
        setErrorMessage('There was an error editing this item.');
      }
    }
    if (goalProgress.some((p: Progress) => p.cellNumber === cellNumber)) {
      setErrorMessage("You've already checked this square.");
    }
  };

  const lastCheckedCell = useMemo(() => {
    if (!goalProgress || !goalProgress.length) {
      return 0;
    }

    return Math.max(...goalProgress.map((gp: Progress) => gp.cellNumber));
  }, [goalProgress]);

  const deleteAllProgress = async () => {
    await database.write(async () => {
      await database.get('progresses').query().destroyAllPermanently();
    });
  };

  return (
    <View style={styles.container}>
      {!goal ? (
        <ActivityIndicator color={Colors.brand.quaternary} />
      ) : (
        <>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'baseline',
            }}
          >
            <Text variant='headlineLarge' style={{ marginBottom: 10 }}>
              {goal.title}
            </Text>
            <Text variant='headlineLarge'>
              {`${Math.floor((goalProgress.length / 100) * 100)} %`}
            </Text>
          </View>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: 10 }).map((_, colIndex) => {
                const cellNumber = Number(`${rowIndex}${colIndex}`);
                const cellDisabled = Boolean(goalProgress.length)
                  ? cellNumber > lastCheckedCell + 1
                  : cellNumber !== 0;
                const cellCompleted = goalProgress.some(
                  (p: Progress) => p.cellNumber === cellNumber
                );
                return (
                  <Pressable
                    key={colIndex}
                    disabled={cellDisabled}
                    onPress={() => handleCellPress(cellNumber, cellCompleted)}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: cellCompleted
                          ? Colors.brand.quaternary
                          : Colors.brand.cream,
                        borderColor: cellCompleted
                          ? Colors.brand.quaternary
                          : cellDisabled
                          ? 'gray'
                          : Colors.brand.charcoal,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
          <Text style={{ marginTop: 20 }} variant='headlineSmall'>
            Description:
          </Text>
          <Text variant='bodyMedium'>{description}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.brand.charcoal,
    shadowColor: Colors.brand.charcoal,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
  },
});
