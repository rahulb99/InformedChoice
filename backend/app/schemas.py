from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional


class ProductSearchRequest(BaseModel):
    fdc_id: Optional[int] = Field(None, description="FDC ID of the product")
    gtin_upc: Optional[str] = Field(None, description="GTIN/UPC of the product")
    query: Optional[str] = Field(None, description="Natural language search query")

class HealthIssueDetail(BaseModel):
    issue: str
    evidence: str

class IngredientHealthIssue(BaseModel):
    ingredient: str
    issues: List[HealthIssueDetail]

class PotentialHealthIssues(BaseModel):
    potential_health_issues: List[IngredientHealthIssue]

class DieticanAgentResponse(BaseModel):
    score: int = Field(..., ge=1, le=5)
    score_explanation: str

class ProductSearchResponse(BaseModel):
    name: str
    brand: Optional[str] = None
    ingredients: List[str]
    category: Optional[str] = None
    processed_score: int = Field(..., ge=1, le=5)
    processed_score_explanation: str
    nutrition_score: int = Field(..., ge=1, le=5)
    nutrition_score_explanation: str
    health_issues: PotentialHealthIssues
    retailer: Optional[str] = None
    url: Optional[HttpUrl] = None

class AutocompleteSuggestion(BaseModel):
    fdc_id: int
    name: str
    brand: Optional[str] = None
    category: str

class ErrorResponse(BaseModel):
    detail: str

class ServiceHealthCheckResponse(BaseModel):
    status: str = Field(..., description="Health status of the service")
    timestamp: str = Field(..., description="ISO timestamp of the health check")
    version: str = Field(..., description="API version")
