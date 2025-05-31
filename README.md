# InformedChoice MVP

InformedChoice is a food transparency application that helps consumers make informed decisions about food products by analyzing processing levels and providing detailed ingredient information. The app searches across multiple retailers and provides a processing score from 1-5 based on ingredient analysis.

## 🚀 Features

### Current Implementation
- **Cross-Retailer Product Search**: Search for products across Walmart, Target, and Publix
- **Natural Language Queries**: Search using descriptive terms like "organic apple juice" or "whole wheat bread"
- **Processing Score Analysis**: 1-5 scale rating based on ingredient processing level
- **Optional Retailer Filtering**: Search specific retailers or all retailers at once
- **Real-time Results**: Fast API responses with detailed product information
- **Modern Mobile UI**: Built with React Native/Expo for cross-platform compatibility

### Processing Score Scale
- **1**: Minimally Processed (single ingredients, whole foods)
- **2**: Processed Culinary Ingredients/Slightly Processed
- **3**: Processed (moderate ingredients, recognizable foods)
- **4**: Ultra-Processed (many additives, artificial ingredients)
- **5**: Highly Ultra-Processed (extensive industrial processing)

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **FastAPI** for REST API endpoints
- **Agno AI Framework** for intelligent product data extraction
- **Crawl4AI** for web scraping and data collection
- **AWS OpenSearch** integration (ready for production)
- **Processing Score Algorithm** with ultra-processed food indicators

### Frontend (TypeScript/Expo)
- **React Native/Expo** for cross-platform mobile development
- **TypeScript** for type safety
- **React Navigation** for screen management
- **Axios** for API communication
- **Picker Component** for retailer selection

## 📂 Project Structure

```
InformedChoice/
├── backend/
│   ├── requirements.txt          # Python dependencies
│   └── app/
│       ├── main.py              # FastAPI application entry point
│       ├── crud.py              # Data operations and search logic
│       └── core/
│           ├── schemas.py       # Pydantic models and API schemas
│           └── agent.py         # Agno AI agent for product search
├── frontend/
│   └── informedchoice-app/
│       ├── App.tsx              # Main application component
│       ├── package.json         # Node.js dependencies
│       └── src/
│           ├── components/      # Reusable UI components
│           ├── navigation/      # Navigation configuration
│           ├── screens/         # App screens (Search, Results)
│           ├── services/        # API service layer
│           └── types/           # TypeScript type definitions
└── README.md                    # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend/informedchoice-app
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   ```

4. **Run the app**:
   - **Web**: Press `w` in the terminal or visit `http://localhost:8081`
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

## 🔌 API Endpoints

### POST `/v1/search-products`

Search for products using natural language queries.

**Request Body**:
```json
{
  "query": "organic apple juice",
  "retailer": "walmart"  // Optional: "walmart", "target", "publix"
}
```

**Response**:
```json
{
  "product_name": "Great Value Organic Apple Juice",
  "retailer": "walmart",
  "ingredients": ["ORGANIC APPLE JUICE", "WATER", "VITAMIN C"],
  "processing_score": 2,
  "score_explanation": "Processed Culinary Ingredients/Slightly Processed: Ingredients used to prepare minimally processed foods, or minimally processed foods with a few added culinary ingredients.",
  "product_url": "https://www.walmart.com/ip/great-value-apple-juice/123456"
}
```

## 🧪 Testing

### Test the API directly:

1. **Search with specific retailer**:
   ```bash
   curl -X POST "http://localhost:8000/v1/search-products" \
     -H "Content-Type: application/json" \
     -d '{"query": "organic spinach", "retailer": "walmart"}'
   ```

2. **Cross-retailer search**:
   ```bash
   curl -X POST "http://localhost:8000/v1/search-products" \
     -H "Content-Type: application/json" \
     -d '{"query": "apple juice"}'
   ```

3. **Error testing**:
   ```bash
   curl -X POST "http://localhost:8000/v1/search-products" \
     -H "Content-Type: application/json" \
     -d '{"query": "error"}'
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory for production configuration:

```env
# Google AI (for Gemini integration)
GOOGLE_API_KEY=your_google_api_key_here

# AWS OpenSearch (for production)
AWS_OPENSEARCH_ENDPOINT=your_opensearch_endpoint
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# API Configuration
CORS_ORIGINS=["http://localhost:8081", "exp://192.168.1.100:8081"]
```

### Frontend Configuration

Update `src/services/apiService.ts` for different environments:

```typescript
// Development
const API_BASE_URL = 'http://localhost:8000/v1';

// Production
const API_BASE_URL = 'https://your-production-api.com/v1';
```

## 🚧 Development Status

### ✅ Completed Features
- [x] FastAPI backend with CORS support
- [x] Natural language product search endpoint
- [x] Cross-retailer search functionality
- [x] Processing score calculation algorithm
- [x] Agno AI agent integration with fallback mock data
- [x] React Native frontend with Expo
- [x] Search screen with retailer selection
- [x] Results screen with detailed product information
- [x] TypeScript interfaces and type safety
- [x] Error handling and loading states
- [x] Responsive UI design

### 🔄 In Progress
- [ ] Real Agno AI agent implementation (currently uses fallback)
- [ ] AWS OpenSearch integration
- [ ] Production deployment configuration

### 📋 Future Enhancements
- [ ] User authentication and profiles
- [ ] Favorite products and shopping lists
- [ ] Nutritional information integration
- [ ] Barcode scanning functionality
- [ ] Push notifications for product updates
- [ ] Social sharing features
- [ ] Advanced filtering and sorting options

## 🐛 Known Issues

1. **Agno Agent Fallback**: Currently using mock data as fallback when Agno agent is not configured
2. **CORS Configuration**: May need adjustment for different deployment environments
3. **Rate Limiting**: No rate limiting implemented for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@informedchoice.app or create an issue in the GitHub repository.

---

Built with ❤️ for better food transparency and informed consumer choices.