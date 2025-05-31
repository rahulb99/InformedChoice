import { ProductSearchResponse } from "../services/apiService";

export type AppNavigatorParamList = {
  Search: { barcodeData?: string } | undefined; // Search screen can receive barcode data
  Results: { productInfo: ProductSearchResponse }; // Results screen expects productInfo
  BarcodeScanner: undefined; // No params for BarcodeScanner screen
};
