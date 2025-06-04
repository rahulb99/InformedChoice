from agno.agent import RunResponse
from dotenv import load_dotenv
from pydantic import HttpUrl, ValidationError
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

import app.agent as agent
from app.schemas import ProductSearchResponse, AutocompleteSuggestion, ProductSearchRequest, PotentialHealthIssues, DieticanAgentResponse

import os
import re
from typing import List, Optional, Tuple


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

async def search_products_by(condition) -> Optional[ProductSearchResponse]:
    """Search for products in the PostgreSQL database"""
    # try:
    async with async_session() as cursor:
        search_query = f"SELECT * FROM products WHERE {condition}"
        
        result = await cursor.execute(text(search_query))
        row = result.mappings().first()
        
        if not row:
            print(f"PostgreSQL: No results found for {condition}")
            return None
        
        fdc_id: int = row['fdc_id']
        name: str = row['description']
        brand: Optional[str] = row['brand_name'] or row['brand_owner'] or None
        ingredients: str = row['ingredients']
        nutrition_info: str = row['nutrition_info']

        set_query = "" 
        
        if row.get('processed_score') is None:
            # Calculate processing score
            processed_score, processed_score_explanation = await calculate_processed_score(ingredients)
            set_query += "processed_score = :processed_score, processed_score_explanation = :processed_score_explanation, "
        else:
            processed_score = row['processed_score']
            processed_score_explanation = row['processed_score_explanation']

        if row.get('nutrition_score') is None:
            # Calculate nutrition score
            nutrition_score, nutrition_score_explanation = await calculate_nutrition_score(nutrition_info)
            set_query += "nutrition_score = :nutrition_score, nutrition_score_explanation = :nutrition_score_explanation, "
        else:
            nutrition_score = row['nutrition_score']
            nutrition_score_explanation = row['nutrition_score_explanation']

        if row.get('health_issues') is None:
            # Get potential health issues
            health_issues: PotentialHealthIssues = await get_health_issues(ingredients)
            set_query += "health_issues = :health_issues, "
        else:
            health_issues = row['health_issues']
        
        if row.get('url') is None:
            # Get product URL
            url = await get_product_url(name, brand)
            if url:
                set_query += "url = :url, "
        else:
            url = row['url']

        try:  
            if set_query:
                update_query = f"UPDATE products SET {set_query.rstrip(', ')} WHERE fdc_id = :fdc_id"
                update_params = {'fdc_id': fdc_id}
                if 'processed_score' in set_query:
                    update_params.update({
                        'processed_score': processed_score,
                        'processed_score_explanation': processed_score_explanation
                    })
                if 'nutrition_score' in set_query:
                    update_params.update({
                        'nutrition_score': nutrition_score,
                        'nutrition_score_explanation': nutrition_score_explanation
                    })
                if 'health_issues' in set_query:
                    import json
                    update_params.update({
                        'health_issues': json.dumps(health_issues.model_dump())
                    })
                if 'url' in set_query:
                    update_params.update({'url': url})
                
                await cursor.execute(text(update_query), update_params)
                try:
                    await cursor.commit()
                    print(f"Updated product {fdc_id} with {set_query}")
                except Exception as commit_error:
                    print(f"Error committing update for product {fdc_id}: {commit_error}")
        except Exception as e:
            print(f"Error updating product {fdc_id}: {e}")

        return ProductSearchResponse(
            name=name,
            brand=brand,
            ingredients=re.split(r'[,;]', ingredients.strip()),
            category=row['branded_food_category'],
            processed_score=processed_score,
            processed_score_explanation=processed_score_explanation,
            nutrition_score=nutrition_score,
            nutrition_score_explanation=nutrition_score_explanation,
            health_issues=health_issues,
            # retailer=row.get('retailer'),
            url=url
        )
        
    # except Exception as e:
    #     print(f"Error searching/updating PostgreSQL database: {e}")
    #     return None
        

async def search_products(request: ProductSearchRequest) -> Optional[ProductSearchResponse]:
    """
    Searches for products using natural language query.
    Search strategy:
    1. First searches local PostgreSQL database
    2. If no relevant results found, falls back to mock data for testing
    """
    print(f"Searching for '{request}'")
    
    if request.fdc_id:
        postgres_result = await search_products_by(f'fdc_id = {request.fdc_id}')
    elif request.gtin_upc:
        print(request.gtin_upc)
        postgres_result = await search_products_by(f'gtin_upc = \'{request.gtin_upc}\'')
    elif request.query:
        postgres_result = await search_products_by(f'autocomplete @@ plainto_tsquery(\'{request.query.lower().replace(" ", "+")}\')')

    if postgres_result:
        print(f"PostgreSQL found result: '{postgres_result.name}'")
        return postgres_result
    
    return None

async def calculate_processed_score(ingredients: str) -> Tuple[int, str]:
    """
    Calculate food processing score based on ingredients list
    
    Returns:
        Tuple of (score, explanation) where score is 1-5 and explanation describes the score
    """
    result: RunResponse = await agent.get_processed_score.arun(f"Ingredients: {ingredients}")
    result: DieticanAgentResponse = result.content
    return (result.score, result.score_explanation.strip())

async def get_health_issues(ingredients: str) -> PotentialHealthIssues:
    """
    Get potential health issues based on ingredients list
    
    Returns:
        List of health issues
    """
    issues: RunResponse = await agent.get_health_issues.arun(f"Ingredients: {ingredients}")
    issues: PotentialHealthIssues = issues.content
    return issues
    
async def calculate_nutrition_score(nutrients: str) -> Tuple[int, str]:
    """
    Calculate nutrients score based on FDC ID
    
    Returns:
        Tuple of (score, explanation) where score is 1-5 and explanation describes the score
    """
    result: RunResponse = await agent.get_nutrition_score.arun(f"Nutritional Information: {nutrients}")
    result: DieticanAgentResponse = result.content
    return (result.score, result.score_explanation.strip())

async def get_product_url(name: str, brand: Optional[str]) -> Optional[str]:
    """
    Get product URL from PostgreSQL database by FDC ID
    """
    try:
        result: RunResponse = await agent.get_product_url.arun(f"{name} {f'by {brand}' if brand else ''}")
        result: HttpUrl = result.content.strip()
        return str(result)
    except ValidationError as e:
        print(f"Validation error getting product URL: {e}")
        return None
