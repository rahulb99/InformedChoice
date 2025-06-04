import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { ProductSearchResponse, IngredientHealthIssue, HealthIssueDetail } from '../services/apiService';

interface ProductDetailsCardProps {
  productInfo: ProductSearchResponse;
}

const getScoreColor = (score: number) => {
  if (score <= 2) return '#4CAF50';
  if (score === 3) return '#FFC107';
  return '#F44336';
};

const getScoreBackground = (score: number) => {
  if (score <= 2) return '#E8F5E8';
  if (score === 3) return '#FFF8E1';
  return '#FFEBEE';
};

export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ productInfo }) => {
  const processedScoreColor = getScoreColor(productInfo.processed_score);
  const nutritionScoreColor = getScoreColor(productInfo.nutrition_score);
  const processedScoreBackground = getScoreBackground(productInfo.processed_score);
  const nutritionScoreBackground = getScoreBackground(productInfo.nutrition_score);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerCard}>
        {productInfo.name && (
          <Text style={styles.productName}>{productInfo.name}</Text>
        )}
        {productInfo.brand && (
          <Text style={styles.brandName}>{productInfo.brand}</Text>
        )}
        <View style={styles.metaRow}>
          {productInfo.retailer && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Available at</Text>
              <Text style={styles.metaValue}>{productInfo.retailer.charAt(0).toUpperCase() + productInfo.retailer.slice(1)}</Text>
            </View>
          )}
          {productInfo.category && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{productInfo.category}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Scores Grid */}
      <View style={styles.scoresGrid}>
        <View style={[styles.scoreCard, { backgroundColor: processedScoreBackground }]}>
          <Text style={styles.scoreCardTitle}>Processed Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: processedScoreColor }]}>
              {productInfo.processed_score}/5
            </Text>
          </View>
          <Text style={styles.scoreExplanation}>{productInfo.processed_score_explanation}</Text>
        </View>

        <View style={[styles.scoreCard, { backgroundColor: nutritionScoreBackground }]}>
          <Text style={styles.scoreCardTitle}>Nutrition Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: nutritionScoreColor }]}>
              {productInfo.nutrition_score}/5
            </Text>
          </View>
          <Text style={styles.scoreExplanation}>{productInfo.nutrition_score_explanation}</Text>
        </View>
      </View>

      {/* Content Grid */}
      <View style={styles.contentGrid}>
        {/* Ingredients Card */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ingredients</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{productInfo.ingredients.length}</Text>
            </View>
          </View>
          {productInfo.ingredients.length > 0 ? (
            <ScrollView style={styles.ingredientsContainer} nestedScrollEnabled={true}>
              <View style={styles.ingredientsGrid}>
                {productInfo.ingredients.map((ingredient: string, index: number) => (
                  <View key={index} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No ingredients listed</Text>
          )}
        </View>

        {/* Health Issues Card */}
        {productInfo.health_issues && productInfo.health_issues.potential_health_issues && productInfo.health_issues.potential_health_issues.length > 0 && (
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Health Concerns</Text>
              <View style={[styles.badge, styles.warningBadge]}>
                <Text style={styles.badgeText}>{productInfo.health_issues.potential_health_issues.length}</Text>
              </View>
            </View>
            <ScrollView style={styles.healthIssuesContainer} nestedScrollEnabled={true}>
              {productInfo.health_issues.potential_health_issues.map((item: IngredientHealthIssue, index: number) => (
                <View key={index} style={styles.healthIssueCard}>
                  <Text style={styles.ingredientNameHeader}>{item.ingredient}</Text>
                  {item.issues.map((issue: HealthIssueDetail, issueIndex: number) => (
                    <View key={issueIndex} style={styles.issueItem}>
                      <Text style={styles.issueTitle}>• {issue.issue}</Text>
                      <Text style={styles.issueEvidence}>{issue.evidence}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Action Button */}
      {productInfo.url && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => Linking.openURL(productInfo.url!)}
        >
          <Text style={styles.actionButtonText}>View Product Online</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  metaItem: {
    alignItems: 'center',
    minWidth: 120,
  },
  metaLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoresGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreExplanation: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    lineHeight: 16,
  },
  contentGrid: {
    gap: 16,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  badge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  warningBadge: {
    backgroundColor: '#FFECB3',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  ingredientsContainer: {
    maxHeight: 200,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  healthIssuesContainer: {
    maxHeight: 300,
  },
  healthIssueCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  ingredientNameHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  issueItem: {
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  issueEvidence: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 12,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
