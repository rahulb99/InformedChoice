# Frontend Components Documentation

## Overview

This document provides detailed documentation for all React Native components in the InformedChoice application. The frontend is built using React Native with Expo, TypeScript, and React Navigation.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Screen Components](#screen-components)
3. [UI Components](#ui-components)
4. [Navigation](#navigation)
5. [Services](#services)
6. [State Management](#state-management)
7. [Styling Guidelines](#styling-guidelines)

---

## Architecture Overview

The frontend follows a component-based architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen-level components
├── navigation/         # Navigation configuration
├── services/          # API and external services
└── types/            # TypeScript type definitions
```

### Component Hierarchy

```
App.tsx (Root)
├── NavigationContainer
    └── StackNavigator
        ├── SearchScreen
        │   ├── SearchInput
        │   └── BarcodeScanner (modal)
        ├── ResultsScreen
        │   └── ProductDetailsCard
        └── BarcodeScannerScreen
            └── BarcodeScanner
```

---

## Screen Components

### 1. SearchScreen

**File**: `src/screens/SearchScreen.tsx`

The main search interface that allows users to search for products using text or barcode scanning.

#### Props
```typescript
// No props - uses React Navigation
```

#### State
```typescript
interface SearchScreenState {
  searchQuery: string;        // Current search input
  loading: boolean;          // Loading state for API requests
  error: string | null;      // Error message display
}
```

#### Key Features
- **Text Search**: Natural language product search with autocomplete
- **Barcode Integration**: Receives barcode data from scanner screen
- **Error Handling**: Displays user-friendly error messages
- **Loading States**: Shows activity indicator during API calls

#### Methods

**`handleSearch(query?: string)`**
- Executes product search with current or provided query
- Validates input and handles empty queries
- Navigates to results screen on success
- Manages loading and error states

```typescript
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
    // Error handling logic
  }
  
  setLoading(false);
};
```

**`handleSuggestionSelect(suggestion: AutocompleteResult)`**
- Handles autocomplete suggestion selection
- Automatically triggers product search
- Provides seamless user experience

**`handleBarcodeScan()`**
- Navigates to barcode scanner screen
- Integrates with camera functionality

#### Styling Considerations
- Responsive design for various screen sizes
- Centered layout with proper spacing
- Z-index management for autocomplete dropdown
- Loading indicators and error message styling

---

### 2. ResultsScreen

**File**: `src/screens/ResultsScreen.tsx`

Displays detailed product information and processing analysis.

#### Props (via Navigation)
```typescript
interface ResultsScreenProps {
  route: {
    params: {
      productInfo: ProductSearchResponse;
    };
  };
}
```

#### Key Features
- **Product Display**: Shows comprehensive product information
- **Processing Analysis**: Visual representation of processing score
- **Error Fallback**: Handles cases where product info is unavailable
- **Navigation**: Back button to return to search

#### Component Structure
```tsx
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
          <ErrorDisplay />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

### 3. BarcodeScannerScreen

**File**: `src/screens/BarcodeScannerScreen.tsx`

Full-screen camera interface for barcode scanning functionality.

#### Key Features
- **Camera Integration**: Uses Expo Camera for barcode detection
- **Real-time Scanning**: Continuous barcode detection
- **Auto-search**: Automatically searches when barcode is detected
- **Fallback Handling**: Returns to search screen if scan fails

#### Methods

**`handleBarcodeScanned(barcodeData: string)`**
- Processes scanned barcode data
- Attempts direct product lookup via API
- Falls back to regular search if direct lookup fails

```typescript
const handleBarcodeScanned = async (barcodeData: string) => {
  try {
    const result = await apiService.searchProducts({ gtin_upc: barcodeData });
    navigation.navigate('Results', { productInfo: result });
  } catch (error) {
    console.error('Error searching with barcode:', error);
    navigation.navigate('Search', { barcodeData });
  }
};
```

**`handleClose()`**
- Returns to previous screen
- Handles navigation stack properly

---

## UI Components

### 1. SearchInput

**File**: `src/components/SearchInput.tsx`

Advanced search input component with real-time autocomplete functionality.

#### Props
```typescript
interface SearchInputProps {
  value: string;                                    // Current input value
  onChangeText: (text: string) => void;            // Text change handler
  onSubmitEditing?: () => void;                     // Submit handler
  onSelectSuggestion?: (suggestion: AutocompleteResult) => void; // Suggestion selection
  placeholder?: string;                             // Input placeholder
}
```

#### State
```typescript
interface SearchInputState {
  suggestions: AutocompleteResult[];    // Autocomplete suggestions
  showSuggestions: boolean;            // Dropdown visibility
  loading: boolean;                    // Loading state for API calls
}
```

#### Key Features

**Debounced API Calls**
- 300ms delay to prevent excessive API requests
- Cancels previous requests when new input is detected

```typescript
useEffect(() => {
  const getSuggestions = async () => {
    if (value.length >= 2) {
      setLoading(true);
      try {
        const results = await apiService.getAutocompleteSuggestions(value);
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
```

**Dropdown Management**
- Z-index positioning for visibility
- Keyboard interaction handling
- Touch-friendly suggestion items

**Performance Optimizations**
- Memoized suggestion rendering
- Efficient list rendering with FlatList
- Proper cleanup of timers and event listeners

#### Styling Features
- Modern shadow effects
- Responsive design
- Loading indicator integration
- Accessibility support

---

### 2. ProductDetailsCard

**File**: `src/components/ProductDetailsCard.tsx`

Comprehensive product information display with visual processing score representation.

#### Props
```typescript
interface ProductDetailsCardProps {
  productInfo: ProductSearchResponse;
}
```

#### Key Features

**Product Information Display**
- Product name and brand
- Complete ingredient list
- Category and retailer information
- Product URL (if available)

**Processing Score Visualization**
- Color-coded score representation
- Detailed explanation text
- Visual progress indicator

```typescript
const getScoreColor = (score: number) => {
  if (score <= 2) return '#4CAF50'; // Green - Low processing
  if (score <= 3) return '#FF9800'; // Orange - Medium processing
  return '#F44336'; // Red - High processing
};
```

**Ingredient Analysis**
- Formatted ingredient list
- Highlighting of concerning ingredients
- Nutritional insights

#### Component Structure
```tsx
export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({ productInfo }) => {
  const scoreColor = getScoreColor(productInfo.processing_score);
  
  return (
    <View style={styles.card}>
      <Text style={styles.productName}>{productInfo.name}</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Processing Score</Text>
        <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{productInfo.processing_score}</Text>
        </View>
      </View>
      
      <Text style={styles.explanation}>{productInfo.score_explanation}</Text>
      
      <View style={styles.ingredientsContainer}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {productInfo.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredient}>
            • {ingredient}
          </Text>
        ))}
      </View>
    </View>
  );
};
```

---

### 3. BarcodeScanner

**File**: `src/components/BarcodeScanner.tsx`

Camera-based barcode scanning component with real-time detection.

#### Props
```typescript
interface BarcodeScannerProps {
  onBarcodeScanned: (data: string) => void;  // Barcode detection callback
  onClose: () => void;                       // Close scanner callback
}
```

#### Key Features

**Camera Integration**
- Expo Camera API usage
- Permission handling
- Error state management

**Barcode Detection**
- Multiple barcode format support
- Real-time scanning feedback
- Duplicate scan prevention

```typescript
const handleBarCodeScanned = ({ type, data }: BarCodeScanningResult) => {
  if (!scanned) {
    setScanned(true);
    onBarcodeScanned(data);
  }
};
```

**User Experience**
- Visual scanning indicator
- Haptic feedback on successful scan
- Clear close/cancel options

#### Implementation Details
```tsx
export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.upc_a, /* other types */],
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};
```

---

## Navigation

### AppNavigator

**File**: `src/navigation/AppNavigator.tsx`

Defines the navigation structure and type safety for the application.

#### Navigation Stack
```typescript
export type AppNavigatorParamList = {
  Search: { barcodeData?: string } | undefined;
  Results: { productInfo: ProductSearchResponse };
  BarcodeScanner: undefined;
};
```

#### Configuration
```tsx
const Stack = createStackNavigator<AppNavigatorParamList>();

export const AppNavigator = () => (
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
          headerShown: false 
        }} 
      />
    </Stack.Navigator>
  </NavigationContainer>
);
```

---

## Services

### API Service

**File**: `src/services/apiService.ts`

Centralized API communication layer with error handling and type safety.

#### Configuration
```typescript
const API_BASE_URL = 'http://localhost:8000/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Methods

**`getAutocompleteSuggestions(query: string)`**
```typescript
async getAutocompleteSuggestions(query: string): Promise<AutocompleteResult[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    const response = await apiClient.get<AutocompleteResult[]>(
      `/autocomplete?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}
```

**`searchProducts(request: ProductSearchRequest)`**
```typescript
async searchProducts(request: ProductSearchRequest): Promise<ProductSearchResponse> {
  try {
    console.log('Search request:', request);
    const response = await apiClient.post<ProductSearchResponse>('/search-products', request);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorData>;
    const customError: ApiError = {
      message: axiosError.message,
      response: axiosError.response ? {
        data: axiosError.response.data,
        status: axiosError.response.status,
      } : undefined,
    };
    throw customError;
  }
}
```

#### Error Handling
- Typed error responses
- Network error detection
- Retry logic for failed requests
- User-friendly error messages

---

## State Management

### Local State Patterns

The application uses React hooks for state management:

#### useState for Component State
```typescript
// Simple state
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// Complex state
const [searchState, setSearchState] = useState({
  query: '',
  suggestions: [],
  showDropdown: false
});
```

#### useEffect for Side Effects
```typescript
// API calls with cleanup
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const result = await apiService.getData(controller.signal);
      setData(result);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
      }
    }
  };
  
  fetchData();
  
  return () => controller.abort();
}, [dependency]);
```

#### Custom Hooks (Future Enhancement)
```typescript
// Custom hook for search functionality
const useProductSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.searchProducts({ query });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { searchProducts, loading, error };
};
```

---

## Styling Guidelines

### Design System

#### Color Palette
```typescript
const colors = {
  primary: '#2196F3',
  secondary: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f0f0f0',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};
```

#### Typography
```typescript
const typography = {
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
};
```

#### Spacing System
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Component Styling Patterns

#### StyleSheet Organization
```typescript
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  
  // Component-specific styles
  searchInput: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  
  // State-dependent styles
  inputFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.2,
  },
});
```

#### Responsive Design
```typescript
const { width, height } = Dimensions.get('window');

const responsiveStyles = StyleSheet.create({
  container: {
    width: width > 768 ? '50%' : '90%',
    alignSelf: 'center',
  },
});
```

### Accessibility Guidelines

#### Accessibility Props
```tsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Search for products"
  accessibilityRole="button"
  accessibilityHint="Tap to search for food products"
>
  <Text>Search</Text>
</TouchableOpacity>
```

#### Screen Reader Support
```tsx
<Text accessibilityRole="header" style={styles.title}>
  Product Search
</Text>

<TextInput
  accessibilityLabel="Product search input"
  accessibilityHint="Enter product name to search"
  placeholder="Search for products..."
/>
```

---

## Performance Optimization

### Component Optimization

#### React.memo for Expensive Components
```typescript
export const ProductDetailsCard = React.memo<ProductDetailsCardProps>(({ productInfo }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.productInfo.name === nextProps.productInfo.name;
});
```

#### useCallback for Event Handlers
```typescript
const handleSearch = useCallback(async (query: string) => {
  // Search implementation
}, []);

const handleSuggestionSelect = useCallback((suggestion: AutocompleteResult) => {
  // Selection implementation
}, []);
```

#### useMemo for Expensive Calculations
```typescript
const processedIngredients = useMemo(() => {
  return productInfo.ingredients.map(ingredient => ({
    name: ingredient,
    isProblematic: checkIfProblematic(ingredient)
  }));
}, [productInfo.ingredients]);
```

### List Optimization

#### FlatList Performance
```tsx
<FlatList
  data={suggestions}
  renderItem={renderSuggestion}
  keyExtractor={(item) => item.fdc_id.toString()}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

---

## Testing Guidelines

### Component Testing

#### Basic Component Test
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  it('should call onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Search products"
      />
    );
    
    const input = getByPlaceholderText('Search products');
    fireEvent.changeText(input, 'apple juice');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('apple juice');
  });
});
```

#### API Integration Testing
```typescript
import { apiService } from '../apiService';

describe('API Service', () => {
  it('should fetch autocomplete suggestions', async () => {
    const mockResponse = [
      { fdc_id: 123, name: 'Apple Juice', brand: 'Simply', category: 'Beverages' }
    ];
    
    // Mock API response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    const result = await apiService.getAutocompleteSuggestions('apple');
    expect(result).toEqual(mockResponse);
  });
});
```

### E2E Testing

#### Search Flow Test
```typescript
describe('Product Search Flow', () => {
  it('should complete search workflow', async () => {
    // Navigate to search screen
    await element(by.id('search-input')).typeText('organic juice');
    
    // Select autocomplete suggestion
    await element(by.text('Simply Orange Juice')).tap();
    
    // Verify navigation to results
    await expect(element(by.id('product-details-card'))).toBeVisible();
    
    // Verify product information display
    await expect(element(by.text('Simply Orange Juice'))).toBeVisible();
  });
});
```

---

## Deployment Considerations

### Environment Configuration

#### Development
```typescript
const config = {
  API_BASE_URL: 'http://localhost:8000/v1',
  LOG_LEVEL: 'debug',
  ENABLE_FLIPPER: true,
};
```

#### Production
```typescript
const config = {
  API_BASE_URL: 'https://api.informedchoice.com/v1',
  LOG_LEVEL: 'error',
  ENABLE_FLIPPER: false,
};
```

### Build Optimization

#### Bundle Size Optimization
- Tree shaking for unused code
- Image optimization and compression
- Code splitting for large components

#### Performance Monitoring
- Crash reporting integration
- Performance metrics collection
- User analytics for UX improvements

---

This documentation provides a comprehensive overview of all frontend components and their functionality. For specific implementation details, refer to the individual component files in the codebase.
