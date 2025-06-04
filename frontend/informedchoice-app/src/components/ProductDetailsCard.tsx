import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { ProductSearchResponse, IngredientHealthIssue, HealthIssueDetail } from '../services/apiService'; // Using ProductSearchResponse from apiService

interface ProductDetailsCardProps {
  productInfo: ProductSearchResponse;
}

const getScoreColor = (score: number) => {
  if (score <= 2) return '#4CAF50'; // Green for 1-2
  if (score === 3) return '#FFC107'; // Amber for 3
  return '#F44336'; // Red for 4-5
};

export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ productInfo }) => {
  const processedScoreColor = getScoreColor(productInfo.processed_score);
  const nutritionScoreColor = getScoreColor(productInfo.nutrition_score);

  return (
    <View style={styles.card}>
      {productInfo.name && (
        <Text style={styles.productName}>{productInfo.name}</Text>
      )}
      {productInfo.brand && (
        <Text style={styles.brandName}>Brand: {productInfo.brand}</Text>
      )}
      {productInfo.retailer &&
        <Text style={styles.retailerName}>Available at: {productInfo.retailer.charAt(0).toUpperCase() + productInfo.retailer.slice(1)}</Text>
      }
      {productInfo.category && (
        <Text style={styles.category}>Category: {productInfo.category}</Text>
      )}

      <View style={styles.scoreSection}>
        <Text style={styles.scoreSectionTitle}>Processed Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score:</Text>
          <Text style={[styles.scoreValue, { color: processedScoreColor }]}>
            {productInfo.processed_score}
          </Text>
        </View>
        <Text style={styles.scoreExplanation}>{productInfo.processed_score_explanation}</Text>
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.scoreSectionTitle}>Nutrition Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score:</Text>
          <Text style={[styles.scoreValue, { color: nutritionScoreColor }]}>
            {productInfo.nutrition_score}
          </Text>
        </View>
        <Text style={styles.scoreExplanation}>{productInfo.nutrition_score_explanation}</Text>
      </View>

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

      {productInfo.health_issues && productInfo.health_issues.potential_health_issues && productInfo.health_issues.potential_health_issues.length > 0 && (
        <View style={styles.healthIssuesSection}>
          <Text style={styles.healthIssuesTitle}>Potential Health Issues:</Text>
          <ScrollView style={styles.healthIssuesScroll} nestedScrollEnabled={true}>
            {productInfo.health_issues.potential_health_issues.map((item: IngredientHealthIssue, index: number) => (
              <View key={index} style={styles.healthIssueIngredientBlock}>
                <Text style={styles.healthIssueIngredientName}>{item.ingredient}:</Text>
                {item.issues.map((issue: HealthIssueDetail, issueIndex: number) => (
                  <View key={issueIndex} style={styles.healthIssueDetail}>
                    <Text style={styles.healthIssueText}>• {issue.issue}:</Text>
                    <Text style={styles.healthIssueEvidence}>{issue.evidence}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {productInfo.url && (
        <TouchableOpacity onPress={() => Linking.openURL(productInfo.url!)}>
          <Text style={styles.productUrl}>View Product Online</Text>
        </TouchableOpacity>
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
    fontSize: 24, // Slightly larger
    fontWeight: 'bold',
    marginBottom: 8, // Adjusted margin
    color: '#333',
    textAlign: 'center',
  },
  brandName: { // New style for brand
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
    textAlign: 'center',
  },
  retailerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10, // Adjusted margin
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
  scoreSection: { // New style for grouping score and its explanation
    marginBottom: 20,
    alignItems: 'center', // Center title and content
  },
  scoreSectionTitle: { // New style for "Processed Score" / "Nutrition Score" titles
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
    marginTop: 5, // Added margin top for spacing from score value
    textAlign: 'center',
    paddingHorizontal: 10, // Add some padding so text doesn't touch edges
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ingredientsScroll: {
    maxHeight: 150, // Adjusted height
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  ingredientItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
  healthIssuesSection: { // New style
    marginTop: 20,
  },
  healthIssuesTitle: { // New style
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  healthIssuesScroll: { // New style
    maxHeight: 250,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  healthIssueIngredientBlock: { // New style
    marginBottom: 15,
  },
  healthIssueIngredientName: { // New style
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
  },
  healthIssueDetail: { // New style
    marginLeft: 10,
    marginBottom: 8,
  },
  healthIssueText: { // New style
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  healthIssueEvidence: { // New style
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginLeft: 10, // Indent evidence under the issue
  },
  productUrl: { // New style
    fontSize: 16,
    color: '#007AFF', // Standard link color
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
