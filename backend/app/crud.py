from dotenv import load_dotenv
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Optional, Tuple

from .core.schemas import ProductSearchResponse, AutocompleteSuggestion, ProductSearchRequest
# from .core.agent import get_product_search_agent  # Commented out for now

load_dotenv()

# PostgreSQL configuration
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,            # number of connections in the pool
    max_overflow=20,         # additional connections allowed beyond pool_size
    pool_timeout=30,         # seconds to wait for a connection
    pool_recycle=1800        # recycle connections after 30 minutes
)

async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_autocomplete_suggestions(query: str) -> List[AutocompleteSuggestion]:
    """Get autocomplete suggestions from PostgreSQL"""
    try:
        async with async_session() as cursor:
            search_query = f"""
                SELECT fdc_id, description, brand_name, brand_owner, branded_food_category
                FROM search_products($${query.lower().replace(' ','+')}$$)
                LIMIT 5
            """
            
            result = await cursor.execute(text(search_query))
            rows = result.mappings().all()
            
            suggestions = []
            for row in rows:
                suggestions.append(AutocompleteSuggestion(
                    fdc_id=row['fdc_id'],
                    name=row['description'],
                    brand=row['brand_name'] or row['brand_owner'] or '',  # TODO: Include brand_owner if brand_name is not available?
                    category=row['branded_food_category'] or ''
                ))
                
            
            return suggestions
        
    except Exception as e:
        print(f"Error getting autocomplete suggestions: {e}")
        return []

async def search_productsdb_by(condition) -> Optional[ProductSearchResponse]:
    """Search for products in the PostgreSQL database"""
    try:
        async with async_session() as cursor:
            search_query = f"SELECT * FROM products WHERE {condition}"
            
            result = await cursor.execute(text(search_query))
            row = result.mappings().first()
            
            if not row:
                print(f"PostgreSQL: No results found for {condition}")
                return None
            
            # Extract ingredients list
            ingredients = row['ingredients']
            if isinstance(ingredients, str):
                # Convert comma-separated string to list
                ingredients = [ing.strip() for ing in ingredients.split(',')]
            
            # Calculate processing score
            processing_score, score_explanation = calculate_processing_score(ingredients)
                            
            return ProductSearchResponse(
                name=row['description'],
                ingredients=ingredients,
                category=row['branded_food_category'],
                processing_score=processing_score,
                score_explanation=score_explanation,
                # retailer=row.get('retailer'),
                # url=row.get('product_url')
            )
        
    except Exception as e:
        print(f"Error searching PostgreSQL database: {e}")
        return None
    

async def search_products(request: ProductSearchRequest) -> Optional[ProductSearchResponse]:
    """
    Searches for products using natural language query.
    Search strategy:
    1. First searches local PostgreSQL database
    2. If no relevant results found, falls back to mock data for testing
    """
    print(f"Searching for '{request}'")
    
    # Step 1: Search PostgreSQL database first
    print("Step 1: Searching PostgreSQL database...")
    if request.fdc_id:
        postgres_result = await search_productsdb_by(f'fdc_id = {request.fdc_id}')
    elif request.gtin_upc:
        print(request.gtin_upc)
        postgres_result = await search_productsdb_by(f'gtin_upc = \'{request.gtin_upc}\'')
    elif request.query:
        postgres_result = await search_productsdb_by(f'autocomplete @@ plainto_tsquery(\'{request.query.lower().replace(" ", "+")}\')')

    if postgres_result:
        print(f"PostgreSQL found result: '{postgres_result.name}'")
        return postgres_result
    
    # Step 2: If no results from PostgreSQL, use mock data as fallback
    print("Step 2: No results from PostgreSQL, falling back to mock data...")
    # try:
    #     agent = get_product_search_agent()
    #     agno_result = await agent.search_product(query, None)
    #     
    #     if agno_result:
    #         print(f"Agno Agent: Found '{agno_result.product_name}' with score {agno_result.processing_score}")
    #         return agno_result
    #     else:
    #         print("Agno agent also returned no results")
    #         
    # except Exception as e:
    #     print(f"Error with Agno agent: {e}")
    
    # Step 3: Final fallback with mock data for testing
    print("Step 3: Using mock data fallback for testing...")
    # return create_mock_product_response(request.query)
    return None


# Simplified processing score algorithm for MVP
ULTRA_PROCESSED_INDICATORS = [
    "HIGH FRUCTOSE CORN SYRUP", "HYDROGENATED OIL", "ARTIFICIAL SWEETENER",
    "EMULSIFIER", "THICKENER", "ARTIFICIAL FLAVOR", "ARTIFICIAL COLOUR",
    "MODIFIED STARCH", "SODIUM NITRITE", "POTASSIUM SORBATE", "MONOSODIUM GLUTAMATE",
    "POLYSORBATE", "SODIUM STEAROYL LACTYLATE", "DATEM" 
] # Case-insensitive matching will be needed

SCORE_EXPLANATIONS = {
    1: "Minimally Processed: Single-ingredient foods or those with very few, easily recognizable whole-food ingredients.",
    2: "Processed Culinary Ingredients/Slightly Processed: Ingredients used to prepare minimally processed foods, or minimally processed foods with a few added culinary ingredients.",
    3: "Processed: Foods with a moderate number of ingredients, some of which might be processed. Still largely recognizable.",
    4: "Ultra-Processed: Many ingredients, including additives not typically used in home kitchens (e.g., artificial flavors/colors, emulsifiers, thickeners).",
    5: "Highly Ultra-Processed: Extensively modified, long ingredient lists dominated by industrial formulations and additives. Little to no intact whole food."
}

def calculate_processing_score(ingredients: List[str]) -> Tuple[int, str]:
    """
    Calculate food processing score based on ingredients list
    
    Returns:
        Tuple of (score, explanation) where score is 1-5 and explanation describes the score
    """
    if not ingredients:
        return 1, SCORE_EXPLANATIONS[1]
    
    # Convert to uppercase for case-insensitive matching
    upper_ingredients = [ing.upper() for ing in ingredients]
    
    # Count ultra-processed indicators
    indicator_count = 0
    for indicator in ULTRA_PROCESSED_INDICATORS:
        for ingredient in upper_ingredients:
            if indicator in ingredient:
                indicator_count += 1
                break
    
    # Calculate score based on ingredient count and ultra-processed indicators
    ingredient_count = len(ingredients)
    
    if ingredient_count <= 1:
        score = 1
    elif ingredient_count <= 5 and indicator_count == 0:
        score = 2
    elif ingredient_count <= 10 and indicator_count <= 1:
        score = 3
    elif indicator_count >= 4 or ingredient_count > 20:
        score = 5
    else:
        score = 4
        
    return score, SCORE_EXPLANATIONS[score]

def create_mock_product_response(query: str) -> ProductSearchResponse:
    """
    Create a mock product response for testing when real data sources fail
    """
    # Create different mock responses based on query
    if "apple" in query.lower():
        ingredients = ["ORGANIC APPLE JUICE", "WATER", "ASCORBIC ACID (VITAMIN C)"]
        product_name = "Great Value Organic Apple Juice"
        retailer = "walmart"
    elif "bread" in query.lower():
        ingredients = ["WHOLE WHEAT FLOUR", "WATER", "YEAST", "SALT", "HONEY", "SOYBEAN OIL"]
        product_name = "Nature's Own 100% Whole Wheat Bread"
        retailer = "publix"
    elif "cereal" in query.lower():
        ingredients = ["WHOLE GRAIN OATS", "SUGAR", "CORN SYRUP", "SALT", "BAKING SODA", "NATURAL FLAVOR", "VITAMIN E"]
        product_name = "Honey Nut Cheerios"
        retailer = "target"
    else:
        ingredients = ["WATER", "ORGANIC INGREDIENTS", "NATURAL FLAVORS"]
        product_name = f"Organic {query.title()}"
        retailer = "walmart"
    
    # Calculate processing score
    processing_score, score_explanation = calculate_processing_score(ingredients)
    
    return ProductSearchResponse(
        name=product_name,
        retailer=retailer,
        ingredients=ingredients,
        processing_score=processing_score,
        score_explanation=score_explanation,
        url=f"https://www.{retailer}.com/search?q={query.replace(' ', '+')}"
    )
