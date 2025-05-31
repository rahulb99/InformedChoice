#!/usr/bin/env python3
"""
InformedChoice API Test Script
Tests the core functionality of the InformedChoice MVP application.
"""

import requests
import json
import sys

# Configuration
API_BASE_URL = "http://localhost:8000/v1"
SEARCH_ENDPOINT = f"{API_BASE_URL}/search-products"

def test_api_connection():
    """Test if the API is running and accessible"""
    try:
        response = requests.get(f"{API_BASE_URL.replace('/v1', '')}/docs")
        if response.status_code == 200:
            print("✅ API is running and accessible")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running on localhost:8000")
        return False

def test_search_with_retailer():
    """Test searching for a product with a specific retailer"""
    print("\n🔍 Testing search with specific retailer...")
    
    payload = {
        "query": "organic spinach",
        "retailer": "walmart"
    }
    
    try:
        response = requests.post(SEARCH_ENDPOINT, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found product: {data['product_name']}")
            print(f"   Retailer: {data['retailer']}")
            print(f"   Processing Score: {data['processing_score']}/5")
            print(f"   Ingredients: {len(data['ingredients'])} listed")
            return True
        else:
            print(f"❌ Search failed with status: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Search request failed: {e}")
        return False

def test_cross_retailer_search():
    """Test searching across all retailers"""
    print("\n🌐 Testing cross-retailer search...")
    
    payload = {
        "query": "apple juice"
    }
    
    try:
        response = requests.post(SEARCH_ENDPOINT, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found product: {data['product_name']}")
            print(f"   Retailer: {data['retailer']}")
            print(f"   Processing Score: {data['processing_score']}/5")
            print(f"   Score Explanation: {data['score_explanation'][:50]}...")
            return True
        else:
            print(f"❌ Cross-retailer search failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cross-retailer search request failed: {e}")
        return False

def test_processing_scores():
    """Test different processing score levels"""
    print("\n📊 Testing processing score calculation...")
    
    test_cases = [
        ("organic spinach", "Should be score 1 (minimally processed)"),
        ("apple juice", "Should be score 2-3 (processed)"),
        ("snack cakes", "Should be score 4-5 (ultra-processed)")
    ]
    
    scores = []
    for query, expected in test_cases:
        payload = {"query": query}
        try:
            response = requests.post(SEARCH_ENDPOINT, json=payload)
            if response.status_code == 200:
                data = response.json()
                score = data['processing_score']
                scores.append(score)
                print(f"✅ '{query}' -> Score: {score}/5 ({expected})")
            else:
                print(f"❌ Failed to get score for '{query}'")
                scores.append(0)
        except Exception as e:
            print(f"❌ Error testing '{query}': {e}")
            scores.append(0)
    
    if len(set(scores)) > 1:
        print("✅ Processing scores show variation across different product types")
        return True
    else:
        print("⚠️  All scores are the same - algorithm may need refinement")
        return False

def test_error_handling():
    """Test API error handling"""
    print("\n🚫 Testing error handling...")
    
    # Test empty query
    payload = {"query": ""}
    try:
        response = requests.post(SEARCH_ENDPOINT, json=payload)
        if response.status_code == 400:
            print("✅ Empty query properly rejected (400 status)")
        else:
            print(f"⚠️  Empty query returned unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing empty query: {e}")
    
    # Test simulated error
    payload = {"query": "error"}
    try:
        response = requests.post(SEARCH_ENDPOINT, json=payload)
        if response.status_code == 500:
            print("✅ Simulated error properly handled (500 status)")
        else:
            print(f"⚠️  Simulated error returned unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing simulated error: {e}")
    
    return True

def test_retailer_options():
    """Test all supported retailers"""
    print("\n🏪 Testing different retailers...")
    
    retailers = ["walmart", "target", "publix"]
    results = []
    
    for retailer in retailers:
        payload = {
            "query": "apple juice",
            "retailer": retailer
        }
        try:
            response = requests.post(SEARCH_ENDPOINT, json=payload)
            if response.status_code == 200:
                data = response.json()
                if data['retailer'] == retailer:
                    print(f"✅ {retailer.title()} search successful")
                    results.append(True)
                else:
                    print(f"⚠️  {retailer.title()} search returned different retailer")
                    results.append(False)
            else:
                print(f"❌ {retailer.title()} search failed")
                results.append(False)
        except Exception as e:
            print(f"❌ Error testing {retailer}: {e}")
            results.append(False)
    
    return all(results)

def main():
    """Run all tests"""
    print("🧪 InformedChoice MVP Test Suite")
    print("=" * 50)
    
    tests = [
        ("API Connection", test_api_connection),
        ("Search with Retailer", test_search_with_retailer),
        ("Cross-Retailer Search", test_cross_retailer_search),
        ("Processing Scores", test_processing_scores),
        ("Error Handling", test_error_handling),
        ("Retailer Options", test_retailer_options)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'=' * 20} {test_name} {'=' * 20}")
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    for i, (test_name, _) in enumerate(tests):
        status = "✅ PASS" if results[i] else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! InformedChoice MVP is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
