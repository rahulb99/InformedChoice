from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.googlesearch import GoogleSearchTools

from app.schemas import PotentialHealthIssues, DieticanAgentResponse

from textwrap import dedent


get_health_issues = Agent(
    name="Dietician",
    model=Gemini(temperature=0),
    response_model=PotentialHealthIssues,
    use_json_mode=True,
    add_name_to_instructions=True,
    # debug_mode=True,
    instructions=dedent(
        """
        You are an expert in food safety and health risks associated with food ingredients. 
        Your task is to analyze the ingredients of food products and identify potential health issues backed by evidence.
        For each ingredient that might have health issues, provide a detailed analysis including:
        - The ingredient name
        - Potential health issues associated with the ingredient
        - Evidence supporting the health issues
        """)
    )

get_processed_score = Agent(
    name="Dietician",
    model=Gemini(temperature=0),
    use_json_mode=True,
    response_model=DieticanAgentResponse,
    add_name_to_instructions=True,
    # debug_mode=True,
    instructions=dedent(
        """
        You are an expert dietician.
        Your task to analyze the ingredients of food products and provide a score on a scale of 1 to 5 based on the processed nature of the food product.
        Use the following guidelines for scoring:
        1: "Minimally Processed: Single-ingredient foods or those with very few, easily recognizable whole-food ingredients.",
        2: "Processed Culinary Ingredients/Slightly Processed: Ingredients used to prepare minimally processed foods, or minimally processed foods with a few added culinary ingredients.",
        3: "Processed: Foods with a moderate number of ingredients, some of which might be processed. Still largely recognizable.",
        4: "Ultra-Processed: Many ingredients, including additives not typically used in home kitchens (e.g., artificial flavors/colors, emulsifiers, thickeners).",
        5: "Highly Ultra-Processed: Extensively modified, long ingredient lists dominated by industrial formulations and additives. Little to no intact whole food."
        
        Your response should just include the score and a brief explanation of why the score was given.
        """)
    )

get_nutrition_score = Agent(
    name="Dietician",
    model=Gemini(temperature=0),
    use_json_mode=True,
    response_model=DieticanAgentResponse,
    add_name_to_instructions=True,
    # debug_mode=True,
    instructions=dedent(
        """
        You are an expert dietician.
        Your task to analyze the nutrients of food products and provide a score on a scale of 1 to 5 based on its overall nutritional value.
        Use the following guidelines for scoring:
        1: "Very Low Nutritional Value: Contains minimal nutrients, high in empty calories, sugars, and unhealthy fats.",
        2: "Low Nutritional Value: Contains some nutrients but also high in sugars, unhealthy fats, and/or sodium.",
        3: "Moderate Nutritional Value: Contains a balanced mix of nutrients but may still have high levels of sugars, fats, or sodium.",
        4: "High Nutritional Value: Rich in essential nutrients, low in added sugars, unhealthy fats, and sodium.",
        5: "Very High Nutritional Value: Extremely rich in essential nutrients, low in added sugars, unhealthy fats, and sodium. Contains whole foods and minimal processing."
        
        Your response should just include the score and a brief explanation of why the score was given.
        """)
    )

get_product_url = Agent(
    name="Product URL Finder",
    model=Gemini(temperature=0),
    tools=[GoogleSearchTools()],
    response_model=str,
    # use_json_mode=True,
    add_name_to_instructions=True,
    # debug_mode=True,
    instructions=dedent(
        """
        Find a link to buy the food product based on the provided product name, using the Google Search tool.

        Examples:
        Product Name: "Peanut Butter Cup Ice Cream"
        Response: "https://example.com/peanut-butter-cup-ice-cream"

        Product Name: "Chai Tea by oregon chai, inc."
        Response: "https://example.com/chai-tea-oregon-chai-inc"
        
        Your response should just include the URL or "No URL found".
        """)
    )

if __name__ == "__main__":
    ingredients = "milk, cream, skim milk, sugar, buttermilk, whey, peanut butter ribbon and flavor base (peanuts, peanut oil, salt, mono and diglycerides), peanut butter cups (sugar, coconut oil, peanut butter [peanuts, salt], partially defatted peanut flour, nonfat milk, whole milk, cocoa processed with alkali, salt, soy lecithin, natural flavors), chocolate fudge ribbon (corn syrup, sugar, water, palm oil, chocolate liquor, cocoa processed with alkali, pectin, mono and diglycerides, polysorbate 80), corn syrup, contains less than 1% of mono and diglycerides, carob bean gum, guar gum, cellulose gel, cellulose gum, carrageenan."
    get_processed_score.print_response(f"Ingredients: {ingredients}", stream=True)
    # nutrients = "Calcium, Ca - 121MG; Sodium, Na - 136MG; Fatty acids, total polyunsaturated - 1.52G; Energy - 242KCAL; Total Sugars - 21.21G; Total lipid (fat) - 13.64G; Cholesterol - 38MG; Vitamin A, IU - 303IU; Carbohydrate, by difference - 25.76G; Fatty acids, total saturated - 7.58G; Protein - 4.55G; Potassium, K - 205MG; Fiber, total dietary - 1.5G; Fatty acids, total monounsaturated - 4.55G"
    # dietician_3.print_response(f"Ingredients: {nutrients}", stream=True)
    # get_product_url.print_response("energia herbal chai by oregon chai, inc.", stream=True)
    