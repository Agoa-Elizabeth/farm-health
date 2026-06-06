import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { fetchReports } from '../api';

export default function MyReportsScreen() {
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    const data = await fetchReports();
    setReports(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  return (
    <FlatList
      style={styles.container}
      data={reports}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={<Text style={styles.header}>My Reports</Text>}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.crop_type} - {item.predicted_disease || 'Unknown'}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Severity: {item.severity || 'N/A'}</Text>
          <Text>Advisory: {item.advisory || 'Pending analysis'}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No reports yet. Submit one from the sidebar.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2f3' },
  header: { fontSize: 26, fontWeight: 'bold', padding: 20 },
  item: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 10, elevation: 1 },
  title: { fontWeight: '700', marginBottom: 8 },
  empty: { padding: 20, textAlign: 'center', color: '#666' },
});
