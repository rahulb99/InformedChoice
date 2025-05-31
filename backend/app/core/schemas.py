from pydantic import BaseModel, Field
from typing import List, Optional


class ProductSearchRequest(BaseModel):
    fdc_id: Optional[int] = Field(None, description="FDC ID of the product")
    gtin_upc: Optional[str] = Field(None, description="GTIN/UPC of the product")
    query: Optional[str] = Field(None, description="Natural language search query")

class ProductSearchResponse(BaseModel):
    name: str
    ingredients: List[str]
    category: Optional[str] = None
    processing_score: int = Field(..., ge=1, le=5)
    score_explanation: str
    retailer: Optional[str] = None
    url: Optional[str] = None

class AutocompleteSuggestion(BaseModel):
    fdc_id: int
    name: str
    brand: Optional[str] = None
    category: str

class ProductSearchAgentResponse(BaseModel):
    product_name: str
    ingredients: List[str]
    category: Optional[str] = None
    retailer: Optional[str] = None
    product_url: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str

class HealthIssueDetail(BaseModel):
    issue: str
    evidence: str
    specific_components: List[str]

class IngredientHealthIssue(BaseModel):
    ingredient: str
    issues: List[HealthIssueDetail]

class PotentialHealthIssues(BaseModel):
    potential_health_issues: List[IngredientHealthIssue]


    
