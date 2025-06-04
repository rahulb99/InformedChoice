import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, Keyboard, TouchableOpacity, ImageBackground } from 'react-native';
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
      <ImageBackground 
        source={{ uri: 'https://nassaucandy.blog/wp-content/uploads/2022/02/2022-Healthy-Foods_D1.png' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
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
          {/* <View style={styles.searchButtonContainer}>
            <Button title="Search" onPress={() => handleSearch()} disabled={loading} />
          </View> */}
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
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// ...existing code...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white overlay
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  searchContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    zIndex: 2000,
  },
  searchInputContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alternativeContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  orText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barcodeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  barcodeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  loader: {
    marginTop: 30,
    transform: [{ scale: 1.2 }],
  },
  errorText: {
    marginTop: 24,
    marginHorizontal: 20,
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    fontWeight: '500',
  },
});
