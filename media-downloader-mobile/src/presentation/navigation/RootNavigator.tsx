import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import DownloadsScreen from '../screens/DownloadsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navegador principal
 */
export const RootNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: theme.typography.fontSize.lg,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Media Downloader',
          }}
        />
        <Stack.Screen
          name="Downloads"
          component={DownloadsScreen}
          options={{
            title: 'Downloads',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
