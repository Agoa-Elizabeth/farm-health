import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.0.2.2:8000/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signUp = async (payload) => {
  const response = await fetch(`${BASE_URL}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const signIn = async (payload) => {
  const response = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const fetchAnalytics = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/analytics/overview/`, { headers });
  return response.json();
};

export const fetchReports = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reports/`, { headers });
  return response.json();
};

export const submitReport = async (values, image) => {
  const headers = await getAuthHeaders();
  const formData = new FormData();

  formData.append('farmer_name', values.farmer_name);
  formData.append('location', values.location);
  formData.append('crop_type', values.crop_type);
  formData.append('symptoms', values.symptoms);
  formData.append('comments', values.comments);

  if (image) {
    formData.append('image', {
      uri: image.uri,
      name: 'report.jpg',
      type: 'image/jpeg',
    });
  }

  const response = await fetch(`${BASE_URL}/reports/`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  return response.json();
};

export const saveTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};
