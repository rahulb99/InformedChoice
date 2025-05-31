import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Button } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.container}>
        {productInfo ? (
          <ProductDetailsCard productInfo={productInfo} />
        ) : (
          <Text style={styles.errorText}>No product information available.</Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Search Another Product" onPress={() => navigation.goBack()} />
        </View>
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
    padding: 20,
    alignItems: 'center', // Center the card
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%', // Give button a decent width
    alignSelf: 'center',
  },
});
