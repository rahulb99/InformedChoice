export interface ProductSearchRequest {
    query: string;
}

export interface ProductSearchResponse {
    product_name: string;
    retailer: string;
    ingredients: string[];
    processing_score: number;
    score_explanation: string;
    product_url?: string;
}

export interface ErrorResponse {
    detail: string;
}
