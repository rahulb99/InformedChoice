import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProductSearchResponse } from '../services/apiService'; // Using ProductSearchResponse from apiService

interface ProductDetailsCardProps {
  productInfo: ProductSearchResponse;
}

const getScoreColor = (score: number) => {
  if (score <= 2) return '#4CAF50'; // Green for 1-2
  if (score === 3) return '#FFC107'; // Amber for 3
  return '#F44336'; // Red for 4-5
};

export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ productInfo }) => {
  const scoreColor = getScoreColor(productInfo.processing_score);

  return (
    <View style={styles.card}>
      {productInfo.product_name && (
        <Text style={styles.productName}>{productInfo.product_name}</Text>
      )}
      
      { productInfo.retailer &&
        <Text style={styles.retailerName}>Available at: {productInfo.retailer.charAt(0).toUpperCase() + productInfo.retailer.slice(1)}</Text>
      }
      <Text style={styles.category}>Category: {productInfo.category}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Processing Score:</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {productInfo.processing_score}
        </Text>
      </View>
      <Text style={styles.scoreExplanation}>{productInfo.score_explanation}</Text>

      <Text style={styles.ingredientsTitle}>Ingredients:</Text>
      {productInfo.ingredients.length > 0 ? (
        <ScrollView style={styles.ingredientsScroll} nestedScrollEnabled={true}>
          {productInfo.ingredients.map((ingredient: string, index: number) => (
            <Text key={index} style={styles.ingredientItem}>
              - {ingredient}
            </Text>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.ingredientItem}>No ingredients listed.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    width: '100%', // Take full width of its container in ResultsScreen
    maxWidth: 500, // Max width for larger screens if ever used in web
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  retailerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
    color: '#444',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreExplanation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ingredientsScroll: {
    maxHeight: 200, // Limit height and make it scrollable
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  ingredientItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20, // Improve readability
  },
});
