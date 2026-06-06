import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { submitReport } from '../api';

export default function SubmitReportScreen() {
  const [farmerName, setFarmerName] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('banana');
  const [symptoms, setSymptoms] = useState('');
  const [comments, setComments] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera roll access is required to choose an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.cancelled) {
      setImage(result);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await submitReport({ farmer_name: farmerName, location, crop_type: cropType, symptoms, comments }, image);
    setLoading(false);
    if (result.id) {
      Alert.alert('Report submitted', 'Your farm report has been submitted and analyzed.');
      setFarmerName('');
      setLocation('');
      setCropType('banana');
      setSymptoms('');
      setComments('');
      setImage(null);
    } else {
      Alert.alert('Submission failed', JSON.stringify(result));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Submit Report</Text>
      <TextInput style={styles.input} placeholder="Farmer Name" value={farmerName} onChangeText={setFarmerName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Crop Type</Text>
        <View style={styles.cropButtons}>
          <TouchableOpacity style={[styles.cropOption, cropType === 'banana' && styles.cropOptionSelected]} onPress={() => setCropType('banana')}>
            <Text style={[styles.cropText, cropType === 'banana' && styles.cropTextSelected]}>Banana</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cropOption, cropType === 'coffee' && styles.cropOptionSelected]} onPress={() => setCropType('coffee')}>
            <Text style={[styles.cropText, cropType === 'coffee' && styles.cropTextSelected]}>Coffee</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TextInput style={[styles.input, styles.multiline]} placeholder="Symptoms observed" multiline value={symptoms} onChangeText={setSymptoms} />
      <TextInput style={[styles.input, styles.multiline]} placeholder="Comments" multiline value={comments} onChangeText={setComments} />
      <Button title="Choose Image" onPress={pickImage} />
      {image && <Image source={{ uri: image.uri }} style={styles.image} />}
      <Button title={loading ? 'Submitting...' : 'Submit Report'} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#eef2f3' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#ddd' },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: '#ddd', padding: 12 },
  label: { marginBottom: 8, fontWeight: '600' },
  cropButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cropOption: { flex: 1, padding: 12, backgroundColor: '#f7f7f7', borderRadius: 8, marginRight: 10, alignItems: 'center' },
  cropOptionSelected: { backgroundColor: '#1f7a8c' },
  cropText: { color: '#333' },
  cropTextSelected: { color: '#fff', fontWeight: '700' },
  picker: { width: '100%' },
  image: { width: '100%', height: 200, borderRadius: 10, marginTop: 12, marginBottom: 16 },
});
