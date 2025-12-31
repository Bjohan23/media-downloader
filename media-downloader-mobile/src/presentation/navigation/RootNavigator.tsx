import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { RootTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import DownloadsScreen from '../screens/DownloadsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * Navegador principal con Tabs
 */
export const RootNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
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
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: 5,
            height: 60,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Nueva Descarga',
            tabBarLabel: 'Descargar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="download-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Downloads"
          component={DownloadsScreen}
          options={{
            title: 'Mis Descargas',
            tabBarLabel: 'Descargas',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
