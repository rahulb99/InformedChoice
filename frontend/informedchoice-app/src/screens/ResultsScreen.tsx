import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { ProductDetailsCard } from '../components/ProductDetailsCard';
import { AppNavigatorParamList } from '../navigation/AppNavigator';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type ResultsScreenRouteProp = RouteProp<AppNavigatorParamList, 'Results'>;
type ResultsScreenNavigationProp = StackNavigationProp<AppNavigatorParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const { productInfo } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      {productInfo ? (
        <View style={styles.contentContainer}>
          <ProductDetailsCard productInfo={productInfo} />
          
          {/* Action Section */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Search Another Product</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>No product information available.</Text>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 60, // Same width as back button for balance
  },
  contentContainer: {
    flex: 1,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});
