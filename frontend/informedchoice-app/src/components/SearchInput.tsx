import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { apiService, AutocompleteResult } from '../services/apiService';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onSelectSuggestion?: (suggestion: AutocompleteResult) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChangeText, 
  onSubmitEditing, 
  onSelectSuggestion,
  placeholder 
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSuggestions = async () => {
      if (value.length >= 2) {
        setLoading(true);
        try {
          const results = await apiService.getAutocompleteSuggestions(value);
          console.log('Autocomplete API response:', results); // Debug log
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionPress = (suggestion: AutocompleteResult) => {
    onChangeText(suggestion.name);
    setShowSuggestions(false);
    onSelectSuggestion?.(suggestion);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (text.length < 2) {
      setShowSuggestions(false);
    }
  };

  const renderSuggestion = ({ item }: { item: AutocompleteResult }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.brand && (
        <Text style={styles.suggestionBrand} numberOfLines={1}>
          Brand: {item.brand}
        </Text>
      )}
      { item.category && (
        <Text style={styles.category} numberOfLines={1}>
          Category: {item.category}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Enter product name"}
          value={value}
          onChangeText={handleTextChange}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          keyboardType="default"
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator 
            size="small" 
            color="#666" 
            style={styles.loadingIndicator} 
          />
        )}
      </View>
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.fdc_id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingRight: 45,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52, // Slightly more space from input
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Higher elevation for Android
    maxHeight: 250, // Increased max height
    zIndex: 9999, // Very high z-index
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  suggestionBrand: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
