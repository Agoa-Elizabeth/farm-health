import React, { useState, useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import MyReportsScreen from './screens/MyReportsScreen';
import SubmitReportScreen from './screens/SubmitReportScreen';
import OutbreakMapScreen from './screens/OutbreakMapScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AppDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Overview">
      <Drawer.Screen name="Overview" component={DashboardScreen} />
      <Drawer.Screen name="My Reports" component={MyReportsScreen} />
      <Drawer.Screen name="Submit Report" component={SubmitReportScreen} />
      <Drawer.Screen name="Outbreak Map" component={OutbreakMapScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setUserToken(token);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (token) => {
        await AsyncStorage.setItem('accessToken', token);
        setUserToken(token);
      },
      signOut: async () => {
        await AsyncStorage.removeItem('accessToken');
        setUserToken(null);
      },
      signUp: async (token) => {
        await AsyncStorage.setItem('accessToken', token);
        setUserToken(token);
      },
    }),
    []
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (
        <AppDrawer />
      ) : (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} authContext={authContext} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" options={{ title: 'Sign Up' }}>
            {(props) => <SignUpScreen {...props} authContext={authContext} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
