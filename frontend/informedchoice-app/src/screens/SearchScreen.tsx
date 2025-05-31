import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, Keyboard, TouchableOpacity } from 'react-native';
import { ProductDetailsCard } from '../components/ProductDetailsCard';
import { SearchInput } from '../components/SearchInput';
import { apiService, ProductSearchResponse, ApiError, AutocompleteResult } from '../services/apiService';
import { AppNavigatorParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type SearchScreenNavigationProp = StackNavigationProp<AppNavigatorParamList, 'Search'>;
type SearchScreenRouteProp = RouteProp<AppNavigatorParamList, 'Search'>;

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();

  // Handle barcode data from navigation params
  useEffect(() => {
    if (route.params?.barcodeData) {
      setSearchQuery(route.params.barcodeData);
      // Automatically search when barcode data is provided
      handleSearch(route.params.barcodeData);
    }
  }, [route.params?.barcodeData]);

  const handleSearch = async (query?: string) => {
    const queryToSearch = query || searchQuery;
    
    if (!queryToSearch.trim()) {
      setError('Search query cannot be empty.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.searchProducts({ query: queryToSearch });
      navigation.navigate('Results', { productInfo: result });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.response) {
        setError(`Error: ${apiErr.response.data.detail || apiErr.message}`);
      } else {
        setError(`An unexpected error occurred: ${apiErr.message}`);
      }
      console.error('Search error:', err);
    }
    setLoading(false);
    if (!query) { // Only clear if not from barcode
      setSearchQuery('');
    }
  };

  const handleSuggestionSelect = async (suggestion: AutocompleteResult) => {
    // Automatically search when a suggestion is selected
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.searchProducts({ fdc_id: suggestion.fdc_id });
      navigation.navigate('Results', { productInfo: result });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.response) {
        setError(`Error: ${apiErr.response.data.detail || apiErr.message}`);
      } else {
        setError(`An unexpected error occurred: ${apiErr.message}`);
      }
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const handleBarcodeScan = () => {
    navigation.navigate('BarcodeScanner');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Informed Choice</Text>
        <Text style={styles.subtitle}>Search for food products</Text>
        
        <View style={[styles.searchContainer, { zIndex: 2000 }]}>
          <View style={styles.searchInputContainer}>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch()}
              onSelectSuggestion={handleSuggestionSelect}
              placeholder="e.g., organic apple juice, whole wheat bread"
            />
          </View>
          <View style={styles.searchButtonContainer}>
            <Button title="Search" onPress={() => handleSearch()} disabled={loading} />
          </View>
        </View>

        <View style={styles.alternativeContainer}>
          <Text style={styles.orText}>or</Text>
          <TouchableOpacity style={styles.barcodeButton} onPress={handleBarcodeScan}>
            <Text style={styles.barcodeButtonText}>📷 Scan Barcode</Text>
          </TouchableOpacity>
        </View>
        
        {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // Add extra padding for autocomplete dropdown
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 20,
    alignItems: 'flex-start', // Align items to the top to handle varying heights
  },
  searchInputContainer: {
    flex: 1, // Takes up available space
    marginRight: 10, // Space between input and button
    zIndex: 2000, // Ensure dropdown appears above other elements
  },
  searchButtonContainer: {
    justifyContent: 'center', // Vertically center button if needed
    // The Button component itself might need height adjustment or its parent
    // For direct vertical alignment with SearchInput, ensure SearchInput's effective height is known
    // Or adjust padding/margins if the Button appears misaligned
    height: '100%', // Ensure button takes full height of the container
  },
  alternativeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  orText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  barcodeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  barcodeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
