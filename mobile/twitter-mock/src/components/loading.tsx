import { View, Text, SafeAreaView, StyleSheet, Platform, StatusBar as rnStatusBar } from "react-native";

export default function Loading () {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Text>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? rnStatusBar.currentHeight : 0,
    flex: 1
  },
})