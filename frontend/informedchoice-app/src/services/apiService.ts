import axios from 'axios';

// Define the base URL for your FastAPI backend
// If running locally for dev, this might be your local IP or localhost
// Ensure your backend is running and accessible from your Expo app (especially on physical devices)
const API_BASE_URL = 'http://localhost:8000/v1'; // Replace with your actual backend URL if different

export interface ProductSearchResponse {
  product_name: string;
  ingredients: string[];
  category: string;
  processing_score: number;
  score_explanation: string;
  retailer?: string;
  product_url?: string;
}

export interface ProductSearchRequest {
  fdc_id?: string;
  gtin_upc?: string;
  query?: string;
}

export interface ApiErrorData {
  detail: string;
}

export interface ApiError {
  message: string;
  response?: {
    data: ApiErrorData;
    status: number;
  };
}

export interface AutocompleteResult {
  fdc_id: string;
  name: string;
  brand: string;
  category: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getAutocompleteSuggestions: async (query: string): Promise<AutocompleteResult[]> => {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      const response = await apiClient.get<AutocompleteResult[]>(`/autocomplete?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  },

  searchProducts: async (request: ProductSearchRequest): Promise<ProductSearchResponse> => {
    try {
      console.log('Search request:', request); // Debug log
      const response = await apiClient.post<ProductSearchResponse>('/search-products', request);
      return response.data;
    } catch (error) {
      const axiosError = error as import('axios').AxiosError<ApiErrorData>; // Type assertion
      const customError: ApiError = {
        message: axiosError.message,
        response: axiosError.response ? {
          data: axiosError.response.data,
          status: axiosError.response.status,
        } : undefined,
      };
      throw customError;
    }
  },
};
