import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchScreen } from './src/screens/SearchScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { BarcodeScannerScreen } from './src/screens/BarcodeScannerScreen';
import { AppNavigatorParamList } from './src/navigation/AppNavigator';

const Stack = createStackNavigator<AppNavigatorParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Search">
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'Search Products' }} 
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen} 
          options={{ title: 'Product Details' }} 
        />
        <Stack.Screen 
          name="BarcodeScanner" 
          component={BarcodeScannerScreen} 
          options={{ 
            title: 'Scan Barcode',
            headerShown: false // Hide header for full-screen camera
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
