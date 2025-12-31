import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/presentation/theme';
import { RootNavigator } from './src/presentation/navigation';

/**
 * Componente principal de la aplicación
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider initialTheme="system">
        <StatusBar style="auto" />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
