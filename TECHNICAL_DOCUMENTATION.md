# InformedChoice Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Documentation](#backend-documentation)
3. [Frontend Documentation](#frontend-documentation)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Data Flow](#data-flow)
7. [Error Handling](#error-handling)
8. [Development Setup](#development-setup)

## Architecture Overview

InformedChoice is a full-stack food transparency application built with a modern microservices architecture:

- **Backend**: FastAPI (Python) with async PostgreSQL integration
- **Frontend**: React Native with Expo for cross-platform mobile development
- **Database**: PostgreSQL with full-text search capabilities
- **AI Integration**: Google Gemini via Agno framework for health risk analysis

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   FastAPI       │    │   PostgreSQL    │
│   Frontend      │───▶│   Backend       │───▶│   Database      │
│   (Expo)        │    │   (Python)      │    │   (Products)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Google Gemini │
                       │   AI Agent      │
                       └─────────────────┘
```

## Backend Documentation

### Core Components

#### 1. FastAPI Application (`main.py`)
The main application entry point that configures the FastAPI server.

```python
# Core Features:
- CORS middleware for cross-origin requests
- Request/response validation with Pydantic
- Error handling with proper HTTP status codes
- API versioning (v1 prefix)
```

**Key Endpoints:**
- `GET /v1/autocomplete` - Product autocomplete suggestions
- `POST /v1/search-products` - Product search with processing analysis

#### 2. Database Layer (`crud.py`)
Handles all database operations using SQLAlchemy with async support.

**Key Functions:**
- `get_autocomplete_suggestions()` - Full-text search for product suggestions
- `search_productsdb_by()` - Search products by specific conditions
- `search_products()` - Main search logic with fallback strategies

**Database Configuration:**
- Connection pooling with asyncpg driver
- Configurable pool size (5 connections, 20 overflow)
- Connection recycling every 30 minutes

#### 3. Schema Definitions (`core/schemas.py`)
Pydantic models for type safety and validation.

**Core Models:**
```python
ProductSearchRequest:
  - fdc_id: Optional[int] - FDC database ID
  - gtin_upc: Optional[str] - Product barcode
  - query: Optional[str] - Natural language search

ProductSearchResponse:
  - name: str - Product name
  - ingredients: List[str] - Ingredient list
  - processing_score: int (1-5) - Processing level score
  - score_explanation: str - Human-readable explanation

AutocompleteSuggestion:
  - fdc_id: int - Unique product identifier
  - name: str - Product name
  - brand: Optional[str] - Brand name
  - category: str - Product category
```

#### 4. AI Agent Integration (`core/agent.py`)
Health risk analysis using Google Gemini through the Agno framework.

```python
health_risk_agent = Agent(
    name="health_risk_agent",
    model=Gemini(temperature=0.2),
    response_model=PotentialHealthIssues,
    instructions="Analyze food ingredients for health risks"
)
```

### Processing Score Algorithm

The application calculates a 1-5 processing score based on ingredient analysis:

1. **Minimally Processed (Score 1)**: Single ingredients, whole foods
2. **Lightly Processed (Score 2)**: Basic processing (frozen, dried, canned)
3. **Moderately Processed (Score 3)**: Some additives, preservatives
4. **Highly Processed (Score 4)**: Multiple additives, artificial ingredients
5. **Ultra-Processed (Score 5)**: Extensive processing, many artificial components

## Frontend Documentation

### Architecture

The frontend is built with React Native using Expo for cross-platform development.

#### Navigation Structure
```
App.tsx (Root)
├── SearchScreen (Initial screen)
├── ResultsScreen (Product details)
└── BarcodeScannerScreen (Camera scanning)
```

### Screen Components

#### 1. SearchScreen (`screens/SearchScreen.tsx`)
Main search interface with autocomplete functionality.

**Key Features:**
- Natural language search input
- Real-time autocomplete suggestions
- Barcode scanning integration
- Error handling and loading states

**State Management:**
```typescript
const [searchQuery, setSearchQuery] = useState<string>('');
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

**Search Methods:**
- Text-based search with autocomplete
- Barcode scanning for direct product lookup
- Suggestion selection for refined search

#### 2. ResultsScreen (`screens/ResultsScreen.tsx`)
Displays detailed product information and processing analysis.

**Features:**
- Product name and brand display
- Ingredient list with analysis
- Processing score visualization
- Category and retailer information

#### 3. BarcodeScannerScreen (`screens/BarcodeScannerScreen.tsx`)
Camera-based barcode scanning functionality.

**Implementation:**
- Expo Camera integration
- Real-time barcode detection
- Automatic product lookup on scan
- Fallback to text search if barcode fails

### UI Components

#### 1. SearchInput (`components/SearchInput.tsx`)
Advanced search input with autocomplete dropdown.

**Features:**
- Debounced API calls (300ms delay)
- Dropdown suggestion list
- Loading indicators
- Keyboard handling

**Styling Considerations:**
- Z-index management for dropdown visibility
- Responsive design for various screen sizes
- Shadow effects for modern UI appearance

#### 2. ProductDetailsCard (`components/ProductDetailsCard.tsx`)
Comprehensive product information display.

**Information Displayed:**
- Product name and brand
- Processing score with color coding
- Complete ingredient list
- Score explanation
- Product category and retailer

**Score Color Coding:**
```typescript
const getScoreColor = (score: number) => {
  if (score <= 2) return '#4CAF50'; // Green - Low processing
  if (score <= 3) return '#FF9800'; // Orange - Medium processing
  return '#F44336'; // Red - High processing
};
```

#### 3. BarcodeScanner (`components/BarcodeScanner.tsx`)
Camera component for barcode scanning.

**Technical Implementation:**
- Expo Camera API integration
- Barcode format detection
- Permission handling
- Error state management

### API Service Layer

#### apiService.ts
Centralized API communication layer using Axios.

**Key Functions:**
```typescript
getAutocompleteSuggestions(query: string): Promise<AutocompleteResult[]>
searchProducts(request: ProductSearchRequest): Promise<ProductSearchResponse>
```

**Error Handling:**
- Axios interceptors for request/response processing
- Typed error responses
- Network error detection
- Retry logic for failed requests

## Database Schema

### Tables Structure

#### Products Table
```sql
CREATE TABLE products (
  fdc_id BIGINT PRIMARY KEY,
  gtin_upc VARCHAR,
  description TEXT,
  brand_owner VARCHAR,
  brand_name VARCHAR,
  ingredients TEXT,
  branded_food_category VARCHAR,
  source VARCHAR,
  autocomplete TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', description || ' ' || brand_name || ' ' || brand_owner)
  ) STORED
);
```

#### Nutrients Table
```sql
CREATE TABLE nutrients (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  fdc_id BIGINT REFERENCES products(fdc_id),
  nutrient_id INT,
  name VARCHAR,
  amount DECIMAL,
  unit_name VARCHAR
);
```

### Search Functionality

#### Full-Text Search Implementation
The database uses PostgreSQL's full-text search capabilities:

```sql
-- Generated tsvector column for fast text search
ADD COLUMN autocomplete tsvector
GENERATED ALWAYS AS (to_tsvector('english', description || ' ' || brand_name || ' ' || brand_owner)) STORED;

-- Search function for product queries
CREATE FUNCTION search_products(input text) RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM products
  WHERE autocomplete @@ plainto_tsquery('english', input)
  ORDER BY ts_rank(autocomplete, plainto_tsquery('english', input)) DESC;
END;
$$ LANGUAGE plpgsql;
```

## API Documentation

### Authentication
Currently, the API does not require authentication (MVP phase).

### Endpoints

#### GET /v1/autocomplete
**Purpose**: Retrieve product suggestions for autocomplete functionality.

**Parameters:**
- `q` (query string): Search query (minimum 2 characters)

**Response:**
```json
[
  {
    "fdc_id": 123456,
    "name": "Organic Apple Juice",
    "brand": "Simply",
    "category": "Beverages"
  }
]
```

**Error Responses:**
- `400`: Invalid query parameter
- `500`: Internal server error

#### POST /v1/search-products
**Purpose**: Search for products and return detailed analysis.

**Request Body:**
```json
{
  "fdc_id": 123456,        // Optional: Direct FDC lookup
  "gtin_upc": "123456789", // Optional: Barcode search
  "query": "organic juice" // Optional: Text search
}
```

**Response:**
```json
{
  "name": "Simply Orange Juice",
  "ingredients": ["Orange Juice", "Natural Flavors"],
  "category": "Beverages",
  "processing_score": 2,
  "score_explanation": "Lightly processed with minimal additives",
  "retailer": "Walmart",
  "url": "https://walmart.com/product/..."
}
```

**Error Responses:**
- `400`: Invalid request parameters
- `404`: Product not found
- `422`: Validation error
- `500`: Internal server error

## Data Flow

### Search Flow Diagram
```
User Input → SearchInput Component → API Service → Backend
    ↓                                                   ↓
SearchScreen ← Results ← ProductDetailsCard ← Database Query
```

### Detailed Flow Steps

1. **User Interaction**
   - User types in SearchInput component
   - Debounced autocomplete requests sent to backend
   - Suggestions displayed in dropdown

2. **Search Execution**
   - User submits search or selects suggestion
   - Request sent to `/v1/search-products` endpoint
   - Backend processes request with fallback strategies

3. **Database Query**
   - Primary: Full-text search on products table
   - Fallback: Mock data for testing purposes
   - Results processed and scored

4. **Response Processing**
   - Processing score calculated
   - Response formatted according to schema
   - Error handling for edge cases

5. **UI Update**
   - Navigation to ResultsScreen
   - Product details displayed in card format
   - Error states handled gracefully

## Error Handling

### Backend Error Handling

#### Database Errors
```python
try:
    result = await cursor.execute(text(search_query), params)
except SQLAlchemyError as e:
    logger.error(f"Database error: {e}")
    return {"error": "Database query failed"}
```

#### Validation Errors
```python
# Automatic validation via Pydantic schemas
class ProductSearchRequest(BaseModel):
    query: Optional[str] = Field(None, min_length=2)
```

### Frontend Error Handling

#### API Errors
```typescript
try {
  const result = await apiService.searchProducts(request);
  navigation.navigate('Results', { productInfo: result });
} catch (err) {
  const apiErr = err as ApiError;
  setError(`Error: ${apiErr.response?.data.detail || apiErr.message}`);
}
```

#### Network Errors
- Connection timeout handling
- Retry logic for failed requests
- Offline state detection
- User feedback for network issues

### Error Categories

1. **Validation Errors (400/422)**
   - Invalid input parameters
   - Missing required fields
   - Format validation failures

2. **Not Found Errors (404)**
   - Product not in database
   - Invalid FDC ID or barcode

3. **Server Errors (500)**
   - Database connection issues
   - Processing failures
   - External API timeouts

4. **Client Errors**
   - Network connectivity issues
   - Invalid responses
   - Permission denied (camera access)

## Development Setup

### Backend Setup

1. **Environment Configuration**
```bash
# Database connection
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/informed_choice

# API Configuration
API_HOST=localhost
API_PORT=8000
```

2. **Dependencies Installation**
```bash
cd backend
pip install -r requirements.txt
```

3. **Database Setup**
```bash
# Create database and tables
psql -d informed_choice -f database/ops.sql

# Import sample data
\copy products FROM 'products.csv' WITH CSV HEADER
```

4. **Development Server**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Dependencies Installation**
```bash
cd frontend/informedchoice-app
npm install
```

2. **Environment Configuration**
```typescript
// Update API_BASE_URL in apiService.ts
const API_BASE_URL = 'http://your-backend-url:8000/v1';
```

3. **Development Server**
```bash
# For iOS Simulator
npm run ios

# For Android Emulator
npm run android

# For Web Development
npm run web
```

### Database Migration

For production deployment, implement proper database migrations:

```sql
-- Version 1.0: Initial schema
CREATE TABLE products (...);
CREATE TABLE nutrients (...);

-- Version 1.1: Add full-text search
ALTER TABLE products ADD COLUMN autocomplete tsvector;
CREATE INDEX idx_products_autocomplete ON products USING gin(autocomplete);
```

## Performance Considerations

### Backend Optimization

1. **Database Indexing**
   - GIN index on tsvector column for fast text search
   - B-tree indexes on frequently queried columns
   - Composite indexes for complex queries

2. **Connection Pooling**
   - SQLAlchemy async engine with connection pooling
   - Configurable pool size based on load
   - Connection recycling to prevent stale connections

3. **Caching Strategy**
   - Redis for frequently accessed products
   - Application-level caching for processing scores
   - CDN for static assets

### Frontend Optimization

1. **Component Performance**
   - React.memo for expensive components
   - useCallback for event handlers
   - Lazy loading for large lists

2. **API Optimization**
   - Debounced search requests
   - Request cancellation for outdated queries
   - Optimistic UI updates

3. **Image Optimization**
   - Compressed image assets
   - Progressive loading
   - Placeholder images

## Security Considerations

### Data Protection
- Input sanitization for all user inputs
- SQL injection prevention via parameterized queries
- XSS protection through proper encoding

### API Security
- Rate limiting for API endpoints
- Request validation and sanitization
- Error message sanitization

### Mobile Security
- Secure storage for sensitive data
- Certificate pinning for API calls
- Biometric authentication (future enhancement)

## Testing Strategy

### Backend Testing
```python
# Unit tests for business logic
pytest app/tests/test_crud.py

# Integration tests for API endpoints
pytest app/tests/test_api.py

# Database tests
pytest app/tests/test_database.py
```

### Frontend Testing
```bash
# Component tests
npm run test:components

# Integration tests
npm run test:integration

# E2E tests with Detox
npm run test:e2e
```

## Deployment

### Backend Deployment
- Docker containerization
- Environment-based configuration
- Health check endpoints
- Logging and monitoring

### Frontend Deployment
- Expo EAS Build for app store distribution
- Web deployment via Expo Web
- CI/CD pipeline integration

### Database Deployment
- PostgreSQL with read replicas
- Automated backups
- Connection pooling
- Performance monitoring

---

This documentation provides a comprehensive overview of the InformedChoice application architecture, components, and functionality. For specific implementation details, refer to the individual source files in the codebase.
