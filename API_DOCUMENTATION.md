# InformedChoice API Documentation

## Overview

The InformedChoice API provides endpoints for searching food products, retrieving nutritional information, and analyzing processing levels. Built with FastAPI, it offers automatic OpenAPI documentation and robust error handling.

**Base URL**: `http://localhost:8000/v1`  
**Version**: 0.1.0  
**Documentation**: `http://localhost:8000/docs` (Swagger UI)

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

No rate limiting is currently implemented in the MVP version.

## Content Type

All endpoints accept and return `application/json` unless otherwise specified.

---

## Endpoints

### 1. Product Autocomplete

#### GET `/v1/autocomplete`

Provides autocomplete suggestions for product search queries.

**Parameters:**

| Parameter | Type   | Required | Description                                    | Example        |
|-----------|--------|----------|------------------------------------------------|----------------|
| `q`       | string | Yes      | Search query (minimum 2 characters)          | `organic juice` |

**Example Request:**
```bash
curl -X GET "http://localhost:8000/v1/autocomplete?q=organic%20juice"
```

**Success Response (200):**
```json
[
  {
    "fdc_id": 123456,
    "name": "Simply Orange Juice",
    "brand": "Simply",
    "category": "Beverages"
  },
  {
    "fdc_id": 789012,
    "name": "Tropicana Orange Juice",
    "brand": "Tropicana", 
    "category": "Beverages"
  }
]
```

**Response Schema:**
```typescript
interface AutocompleteSuggestion {
  fdc_id: number;      // Unique FDC database identifier
  name: string;        // Product name/description
  brand?: string;      // Brand name (optional)
  category: string;    // Product category
}
```

**Error Responses:**

**400 Bad Request** - Invalid query parameter:
```json
{
  "detail": "Query parameter 'q' must be at least 2 characters long"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "detail": "Internal server error occurred while processing request"
}
```

---

### 2. Product Search

#### POST `/v1/search-products`

Searches for products and returns detailed information including processing analysis.

**Request Body:**

At least one of the following parameters must be provided:

| Parameter  | Type   | Required | Description                          | Example           |
|------------|--------|----------|--------------------------------------|-------------------|
| `fdc_id`   | int    | No       | FDC database ID for direct lookup   | `123456`          |
| `gtin_upc` | string | No       | Product barcode/UPC                  | `"041220576470"`  |
| `query`    | string | No       | Natural language search query       | `"organic juice"` |

**Example Requests:**

**Search by query:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "organic apple juice"
  }'
```

**Search by FDC ID:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{
    "fdc_id": 123456
  }'
```

**Search by barcode:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{
    "gtin_upc": "041220576470"
  }'
```

**Success Response (200):**
```json
{
  "name": "Simply Orange Juice",
  "ingredients": [
    "Orange Juice",
    "Natural Flavors",
    "Vitamin C (Ascorbic Acid)"
  ],
  "category": "Beverages",
  "processing_score": 2,
  "score_explanation": "Lightly processed beverage with minimal additives. Contains natural flavors and added vitamins but maintains primary ingredient integrity.",
  "retailer": "Walmart",
  "url": "https://www.walmart.com/ip/simply-orange-juice/12345"
}
```

**Response Schema:**
```typescript
interface ProductSearchResponse {
  name: string;              // Product name
  ingredients: string[];     // List of ingredients in order
  category?: string;         // Product category (optional)
  processing_score: number;  // Processing level (1-5 scale)
  score_explanation: string; // Human-readable score explanation
  retailer?: string;         // Retailer name (optional)
  url?: string;             // Product URL (optional)
}
```

**Processing Score Scale:**
- **1**: Minimally processed (whole foods, single ingredients)
- **2**: Lightly processed (frozen, dried, basic processing)
- **3**: Moderately processed (some additives, preservatives)
- **4**: Highly processed (multiple additives, artificial ingredients)
- **5**: Ultra-processed (extensive processing, many artificial components)

**Error Responses:**

**400 Bad Request** - Invalid request parameters:
```json
{
  "detail": "At least one search parameter (fdc_id, gtin_upc, or query) must be provided"
}
```

**404 Not Found** - Product not found:
```json
{
  "detail": "No product found matching the search criteria"
}
```

**422 Unprocessable Entity** - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "fdc_id"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt",
      "ctx": {"limit_value": 0}
    }
  ]
}
```

**500 Internal Server Error** - Server error:
```json
{
  "detail": "Internal server error occurred while processing search request"
}
```

---

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422), the detail field contains an array of specific validation issues:

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "error_type",
      "ctx": {}
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning                | Description                                    |
|------|------------------------|------------------------------------------------|
| 200  | OK                     | Request successful                             |
| 400  | Bad Request           | Invalid request parameters                     |
| 404  | Not Found             | Resource not found                             |
| 422  | Unprocessable Entity  | Request validation failed                      |
| 500  | Internal Server Error | Server error occurred                          |

---

## Data Models

### Request Models

#### ProductSearchRequest
```typescript
interface ProductSearchRequest {
  fdc_id?: number;    // Optional: FDC database ID
  gtin_upc?: string;  // Optional: Product barcode
  query?: string;     // Optional: Search query
}
```

**Validation Rules:**
- At least one field must be provided
- `fdc_id` must be a positive integer
- `gtin_upc` must be a valid barcode format
- `query` must be at least 2 characters if provided

### Response Models

#### AutocompleteSuggestion
```typescript
interface AutocompleteSuggestion {
  fdc_id: number;      // Unique product identifier
  name: string;        // Product name/description
  brand?: string;      // Brand name (optional)
  category: string;    // Product category
}
```

#### ProductSearchResponse
```typescript
interface ProductSearchResponse {
  name: string;              // Product name
  ingredients: string[];     // Ingredient list
  category?: string;         // Product category
  processing_score: number;  // Processing score (1-5)
  score_explanation: string; // Score explanation
  retailer?: string;         // Retailer name
  url?: string;             // Product URL
}
```

---

## Examples

### Complete Search Workflow

1. **Get autocomplete suggestions:**
```bash
curl "http://localhost:8000/v1/autocomplete?q=apple"
```

2. **Select a product and search:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{"fdc_id": 123456}'
```

### Barcode Scanning Workflow

1. **Scan barcode and search directly:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{"gtin_upc": "041220576470"}'
```

### Natural Language Search

1. **Search with descriptive query:**
```bash
curl -X POST "http://localhost:8000/v1/search-products" \
  -H "Content-Type: application/json" \
  -d '{"query": "organic whole wheat bread"}'
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// API Service class
class InformedChoiceAPI {
  private baseURL = 'http://localhost:8000/v1';

  async getAutocompleteSuggestions(query: string): Promise<AutocompleteSuggestion[]> {
    const response = await fetch(`${this.baseURL}/autocomplete?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Autocomplete request failed');
    return response.json();
  }

  async searchProducts(request: ProductSearchRequest): Promise<ProductSearchResponse> {
    const response = await fetch(`${this.baseURL}/search-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Search request failed');
    return response.json();
  }
}

// Usage example
const api = new InformedChoiceAPI();

// Get suggestions
const suggestions = await api.getAutocompleteSuggestions('organic');

// Search by query
const result = await api.searchProducts({ query: 'organic apple juice' });

// Search by barcode
const barcodeResult = await api.searchProducts({ gtin_upc: '041220576470' });
```

### Python

```python
import requests
from typing import List, Dict, Optional

class InformedChoiceAPI:
    def __init__(self, base_url: str = "http://localhost:8000/v1"):
        self.base_url = base_url

    def get_autocomplete_suggestions(self, query: str) -> List[Dict]:
        response = requests.get(f"{self.base_url}/autocomplete", params={"q": query})
        response.raise_for_status()
        return response.json()

    def search_products(self, fdc_id: Optional[int] = None, 
                       gtin_upc: Optional[str] = None, 
                       query: Optional[str] = None) -> Dict:
        payload = {}
        if fdc_id: payload["fdc_id"] = fdc_id
        if gtin_upc: payload["gtin_upc"] = gtin_upc
        if query: payload["query"] = query
        
        response = requests.post(f"{self.base_url}/search-products", json=payload)
        response.raise_for_status()
        return response.json()

# Usage example
api = InformedChoiceAPI()

# Get suggestions
suggestions = api.get_autocomplete_suggestions("organic")

# Search by query
result = api.search_products(query="organic apple juice")

# Search by barcode
barcode_result = api.search_products(gtin_upc="041220576470")
```

---

## Performance Guidelines

### Request Optimization

1. **Autocomplete Debouncing**: Implement client-side debouncing (300ms) for autocomplete requests
2. **Caching**: Cache autocomplete results for recently searched terms
3. **Request Cancellation**: Cancel pending requests when new ones are initiated

### Response Time Expectations

| Endpoint          | Expected Response Time | Description           |
|-------------------|------------------------|----------------------|
| `/autocomplete`   | < 200ms               | Fast text search     |
| `/search-products`| < 500ms               | Full product lookup  |

### Best Practices

1. **Use specific searches**: Prefer FDC ID or barcode searches when available
2. **Implement retry logic**: Handle temporary network failures gracefully
3. **Monitor usage**: Track API usage patterns for optimization

---

## Development Tools

### Interactive Documentation

Access the interactive Swagger UI documentation at:
- **Development**: `http://localhost:8000/docs`
- **Alternative**: `http://localhost:8000/redoc`

### Testing

Use the provided test script to validate API functionality:

```bash
python test_app.py
```

### Health Check

Monitor API health with a simple status endpoint:

```bash
curl http://localhost:8000/health
```

---

## Changelog

### Version 0.1.0 (Current)
- Initial API implementation
- Product search functionality
- Autocomplete suggestions
- Processing score analysis
- Basic error handling

### Planned Features
- Authentication and rate limiting
- Advanced filtering options
- Nutritional information endpoints
- Batch search capabilities
- Health risk analysis endpoints

---

For technical issues or questions, refer to the main technical documentation or create an issue in the project repository.
