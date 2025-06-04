import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { AppNavigatorParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/apiService';

type BarcodeScannerScreenNavigationProp = StackNavigationProp<AppNavigatorParamList, 'BarcodeScanner'>;

export const BarcodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<BarcodeScannerScreenNavigationProp>();

  const handleBarcodeScanned = async (barcodeData: string) => {
    try {
      // Use the dedicated barcode search endpoint
      const result = await apiService.searchProducts({ gtin_upc: barcodeData });
      if (!result || !result.name) {
        console.warn('No product found for barcode:', barcodeData);
        // Fallback: Navigate back to search with the barcode data as a regular search
        navigation.navigate('Search', { barcodeData });
        return;
      }
      navigation.navigate('Results', { productInfo: result });
    } catch (error) {
      console.error('Error searching with barcode:', error);
      // Fallback: Navigate back to search with the barcode data as a regular search
      navigation.navigate('Search', { barcodeData });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <BarcodeScanner
        onBarcodeScanned={handleBarcodeScanned}
        onClose={handleClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
