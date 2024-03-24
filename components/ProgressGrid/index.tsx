import Colors from '@/constants/Colors';
import { Goal, Progress } from '@/watermelon/models';
import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { ProgressSquare } from './ProgressSquare';
import { useTranslation } from 'react-i18next';
import { set } from 'react-hook-form';

const GRID_SIZE = 10;
const MARGIN = 20;
const { width } = Dimensions.get('window');
const totalSquareMargins = 4 * GRID_SIZE;
const gridWidth = width - MARGIN * 2 - totalSquareMargins;
const squareSize = gridWidth / GRID_SIZE;

export function ProgressGrid({
  goal,
  goalProgress,
  description,
  setSelectedCell,
  setEditingProgress,
  setCanDeleteEditingProgress,
}: {
  goal: Goal | null;
  goalProgress: Progress[];
  description: string | string[];
  setSelectedCell: (value: number) => void;
  setEditingProgress: (value: Progress) => void;
  setCanDeleteEditingProgress: (value: boolean) => void;
}) {
  const { t } = useTranslation();
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
        const isDeletable =
          goalProgress.indexOf(progressToUpdate) === goalProgress.length - 1;
        setEditingProgress(progressToUpdate);
        setCanDeleteEditingProgress(isDeletable);
      } else {
        setErrorMessage(t('errorEditingItem'));
      }
    }
    if (goalProgress.some((p: Progress) => p.cellNumber === cellNumber)) {
      setErrorMessage(t('alreadyChecked'));
    }
  };

  const lastCheckedCell = useMemo(() => {
    if (!goalProgress || !goalProgress.length) {
      return 0;
    }

    return Math.max(...goalProgress.map((gp: Progress) => gp.cellNumber));
  }, [goalProgress]);

  return (
    <View style={styles.gridContainer}>
      {!goal ? (
        <ActivityIndicator color={Colors.brand.quaternary} />
      ) : (
        <>
          <View
            style={{
              width: '100%',
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
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const cellNumber = index;
            const cellDisabled = Boolean(goalProgress.length)
              ? cellNumber > lastCheckedCell + 1
              : cellNumber !== 0;
            const cellCompleted = goalProgress.some(
              (p: Progress) => p.cellNumber === cellNumber
            );

            let moreThanOneDay = false;

            // Check to see if more than 24 hours have passed between lastLoggedDate
            // and the previous cell's lastLoggedDate
            if (cellCompleted) {
              const previousCell = goalProgress.find(
                (p: Progress) => p.cellNumber === cellNumber - 1
              );

              // Only if we have a previous cell
              if (previousCell) {
                const previousDate = previousCell.lastLoggedAt;
                const currentDate = goalProgress.find(
                  (p: Progress) => p.cellNumber === cellNumber
                )?.lastLoggedAt;
                // Sanity check
                if (currentDate && previousDate) {
                  moreThanOneDay = currentDate - previousDate > 86400000;
                }
              }
            }

            return (
              <ProgressSquare
                key={index}
                onPress={() => handleCellPress(cellNumber, cellCompleted)}
                disabled={cellDisabled}
                squareSize={squareSize}
                color={
                  moreThanOneDay
                    ? Colors.brand.tertiary
                    : cellCompleted && !moreThanOneDay
                    ? Colors.brand.quaternary
                    : Colors.brand.cream
                }
                borderColor={
                  cellDisabled
                    ? 'gray'
                    : moreThanOneDay
                    ? Colors.brand.tertiary
                    : cellCompleted && !moreThanOneDay
                    ? Colors.brand.quaternary
                    : Colors.brand.charcoal
                }
              />
            );
          })}
          <View style={{ marginTop: 20, width: '100%' }}>
            <Text variant='headlineSmall'>{t('description')}:</Text>
            <Text variant='bodyMedium'>{description}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: squareSize * GRID_SIZE + totalSquareMargins,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: MARGIN,
  },
  text: {
    width: squareSize * GRID_SIZE,
    marginHorizontal: MARGIN,
    textAlign: 'center',
  },
});
