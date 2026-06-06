import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OutbreakMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Outbreak Map</Text>
      <Text style={styles.body}>
        This section will show outbreak locations, disease hot spots, and regional statistics.
        For now, it presents a mock overview while backend map analytics are integrated.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#eef2f3' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 14 },
  body: { fontSize: 16, color: '#444', textAlign: 'center' },
});
