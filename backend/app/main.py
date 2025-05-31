from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .core.schemas import ProductSearchRequest, ProductSearchResponse, ErrorResponse, AutocompleteSuggestion
from .crud import search_products, get_autocomplete_suggestions

from typing import List

app = FastAPI(
    title="InformedChoice API",
    description="API for fetching Walmart product information and its processing level.",
    version="0.1.0"
)

# CORS Middleware Configuration
origins = [
    "http://localhost:8081",  # Expo Web/Development server
    "exp://*", # For Expo Go app on physical devices (adjust if needed)
    # Add other origins if necessary, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

@app.get("/v1/autocomplete",
         response_model=List[AutocompleteSuggestion],
         responses={
             400: {"model": ErrorResponse, "description": "Invalid query"},
             500: {"model": ErrorResponse, "description": "Internal server error"}
         })
async def autocomplete_endpoint(q: str):
    """
    Get autocomplete suggestions for product search.
    Returns top 5 matching product names.
    """
    query = q.strip()
    
    if not query or len(query) < 2:
        return []

    try:
        suggestions = await get_autocomplete_suggestions(query)
        return suggestions
    except Exception as e:
        print(f"Autocomplete error: {e}")
        return []


@app.post("/v1/search-products",
            response_model=ProductSearchResponse,
            responses={
                400: {"model": ErrorResponse, "description": "Invalid search query"},
                404: {"model": ErrorResponse, "description": "No products found"},
                500: {"model": ErrorResponse, "description": "Internal server error"}
            })
async def search_products_endpoint(request_body: ProductSearchRequest):
    """
    Search for products using natural language query.
    Returns product information including ingredients and processing score.
    """
    print(request_body)
    try:
        if request_body.fdc_id is None and request_body.gtin_upc is None and request_body.query is None:
            raise HTTPException(status_code=400, detail="Search query cannot be empty.")
        product_data = await search_products(request_body)
        if product_data is None:
            raise HTTPException(status_code=404, detail="No products found.")
        return product_data
    except Exception as e:
        # Log the exception e here in a real application
        print(f"An unexpected error occurred: {e}")  # For MVP, print to console
        if "Simulated search error" in str(e):
            raise HTTPException(status_code=500, detail="Error during product search.")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

# To run the backend (save this as a comment or in README):
# cd backend
# python -m uvicorn app.main:app --reload
