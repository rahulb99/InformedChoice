from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.crawl4ai import Crawl4aiTools
from typing import List, Tuple, Optional, Dict
import json
import re

from .schemas import PotentialHealthIssues


health_risk_agent = Agent(
    name="health_risk_agent",
    description="Agent to identify potential health risks in food products based on ingredients.",
    model=Gemini(temperature=0.2),
    response_model=PotentialHealthIssues,
    use_json_mode=True,
    instructions="""You are an expert in food safety and health risks associated with food ingredients. Your task is to analyze the ingredients of food products and identify potential health issues backed by evidence."""
)

product_search_agent = Agent(
    name="product_search_agent",
    description="Agent to search for food products based on natural language queries.",
    model=Gemini(temperature=0.2),
    tools=Crawl4aiTools(),
    response_model=List[Dict[str, str]],
    use_json_mode=True,
    instructions="""You are an expert in searching for food products based on natural language queries. Your task is to find products that match the given query and return their details."""
)

def get_product_search_agent():
    """Get the product search agent instance"""
    return product_search_agent