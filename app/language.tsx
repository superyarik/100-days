import { useDatabase } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useI18n } from '@/contexts/I18nContext';
import i18next from 'i18next';
import { languages } from '@/constants/languages';

const { width } = Dimensions.get('window');
const paddingHorizontal = width * 0.1;

// RN Code
const Item = ({ item, locale }: { item: any; locale: string }) => {
  // @ts-ignore
  const { setLocale } = useI18n();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={async () => {
        await setLocale(item.id);
      }}
      style={[
        styles.item,
        {
          backgroundColor:
            locale === item.id ? Colors.brand.tertiary : Colors.brand.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color:
              locale === item.id ? Colors.brand.cream : Colors.brand.charcoal,
          },
        ]}
      >
        {t(`language_name.${item.id}`, { lng: locale })}
      </Text>
      <Text
        style={[
          styles.title,
          {
            color:
              locale === item.id ? Colors.brand.cream : Colors.brand.charcoal,
          },
        ]}
      >
        {t(`language_name.${item.id}`, { lng: item.id })}
      </Text>
    </Pressable>
  );
};

export default function Language() {
  // @ts-ignore
  const { locale } = useI18n();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <IconButton
        icon='arrow-left'
        style={{
          position: 'absolute',
          left: 16,
          top: 54,
        }}
        onPress={() => router.back()}
      />
      <View style={{ marginTop: 50 }}>
        <FlatList
          data={languages}
          renderItem={({ item }) => <Item item={item} locale={locale} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.cream,
    paddingHorizontal,
    position: 'relative',
  },
  list: {
    paddingHorizontal: 10,
  },
  column: {
    justifyContent: 'space-between',
  },
  item: {
    gap: 8,
    alignItems: 'center',
    padding: 20,
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 4,
    shadowColor: Colors.brand.charcoal,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 5,
  },
});
