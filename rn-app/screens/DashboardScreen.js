import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { fetchAnalytics } from '../api';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAnalytics();
      setStats(data);
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Farm Dashboard</Text>
      {stats ? (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Reports</Text>
            <Text style={styles.cardValue}>{stats.total_reports}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>High/Critical Cases</Text>
            <Text style={styles.cardValue}>{stats.high_critical}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pending Reviews</Text>
            <Text style={styles.cardValue}>{stats.pending_reviews}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resolved Cases</Text>
            <Text style={styles.cardValue}>{stats.resolved_cases}</Text>
          </View>
          <Text style={styles.section}>Recent Reports</Text>
          {stats.recent_reports.map((report) => (
            <View key={report.id} style={styles.reportItem}>
              <Text style={styles.reportTitle}>{report.crop_type} - {report.predicted_disease || 'Pending'}</Text>
              <Text>Status: {report.status}</Text>
              <Text>Severity: {report.severity || 'N/A'}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text>Loading dashboard...</Text>
      )}
      <Button title="Submit a Report" onPress={() => navigation.navigate('Submit Report')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2f3' },
  content: { padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontWeight: '600', marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: '700' },
  section: { marginTop: 20, fontSize: 18, fontWeight: '600' },
  reportItem: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginTop: 10 },
  reportTitle: { fontWeight: '700' },
});
