/**
 * API Client Service
 * Handles all HTTP requests to the backend API
 */

// Use environment variable or fallback to localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:4000/v1';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  retryable: boolean;
}

// Auth Types
export interface SendOTPRequest {
  email: string;
  name?: string;
  isSignup?: boolean;
}

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  session_token: string;
}

export interface VerifyOTPRequest {
  session_token: string;
  code: string;
  email: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  token: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  success: boolean;
  session_token: string;
}

// User Types
export interface UserMeResponse {
  email: string;
  plan: string;
  first_name: string;
  last_name: string;
}

export interface DashboardDataResponse {
  recent_scans: Product[];
  scans_today: number;
  saved_items_Count: number;
  is_pro: boolean;
}

export interface FODMAPLevels {
  fructose: number;
  lactose: number;
  fructans: number;
  gos: number;
  sorbitol: number;
  mannitol: number;
}

export interface DietaryProfileRequest {
  restrictions: string[];
  fodmapLevels?: FODMAPLevels;
}

// Product Types
export interface IngredientData {
  id: string;
  text: string;
  vegan?: string;
  vegetarian?: string;
  from_palm_oil?: string;
  percent?: number;
  percent_estimate?: number;
  ingredients?: IngredientData[];
}

export interface Product {
  id: number;
  barcode: string;
  name: string;
  brands: string;
  categories: string;
  ingredients: string;
  ingredients_data: IngredientData[];
  ingredients_list: string[];
  allergens: string[];
  allergens_from_ingredients: string[];
  allergens_hierarchy: string[];
  safety_rating: string;
  images: string[];
  source: string;
  review_status: string;
  nutriscore_grade: string;
  nova_group: number;
  created_at: string;
  updated_at: string;
}

export interface ProductScanResponse {
  product: Product;
  source: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  currency: string;
  isBestValue: boolean;
  features: string[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
}

export interface PurchaseSubscriptionRequest {
  planId: string;
  paymentMethod: string;
  paymentToken?: string;
  cardDetails?: any;
}

export interface PurchaseSubscriptionResponse {
  success: boolean;
  subscription: {
    isPro: boolean;
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'expired' | 'none';
    expiresAt?: string;
  };
  message?: string;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      }));

      return {
        success: false,
        error: errorData.error || {
          code: `HTTP_${response.status}`,
          message: response.statusText,
        },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async put<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  /**
   * Send OTP for login or signup
   */
  async sendOTP(data: SendOTPRequest): Promise<APIResponse<SendOTPResponse>> {
    return this.post<SendOTPResponse>('/auth/send-otp', data);
  }

  /**
   * Verify OTP for login
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<APIResponse<VerifyOTPResponse>> {
    return this.post<VerifyOTPResponse>('/auth/verify-otp', data);
  }

  /**
   * Register new user with OTP
   */
  async register(data: RegisterRequest): Promise<APIResponse<RegisterResponse>> {
    return this.post<RegisterResponse>('/auth/register', data);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<APIResponse<UserMeResponse>> {
    return this.get<UserMeResponse>('/me');
  }

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<APIResponse<DashboardDataResponse>> {
    return this.get<DashboardDataResponse>('/users/dashboard');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: any): Promise<APIResponse<any>> {
    return this.put('/users/profile', data);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: any): Promise<APIResponse<any>> {
    return this.put('/users/preferences', data);
  }

  /**
   * Save dietary profile
   */
  async saveDietaryProfile(data: DietaryProfileRequest): Promise<APIResponse<any>> {
    return this.post('/users/dietary-profile', data);
  }

  /**
   * Sync saved items with backend
   */
  async syncSavedItems(items: Array<{ productId: string; savedAt: string }>): Promise<APIResponse<any>> {
    return this.post('/users/saved-items', { items });
  }

  // ============================================
  // PRODUCT ENDPOINTS
  // ============================================

  /**
   * Scan product by barcode
   */
  async scanProduct(barcode: string): Promise<APIResponse<ProductScanResponse>> {
    return this.get<ProductScanResponse>(`/products/barcode/${barcode}`);
  }

  /**
   * Add new product
   */
  async addProduct(data: any): Promise<APIResponse<any>> {
    return this.post('/products', data);
  }

  // ============================================
  // SUBSCRIPTION ENDPOINTS
  // ============================================

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<APIResponse<SubscriptionPlansResponse>> {
    return this.get<SubscriptionPlansResponse>('/subscriptions/plans');
  }

  /**
   * Purchase subscription
   */
  async purchaseSubscription(data: PurchaseSubscriptionRequest): Promise<APIResponse<PurchaseSubscriptionResponse>> {
    return this.post<PurchaseSubscriptionResponse>('/subscriptions/purchase', data);
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<APIResponse<any>> {
    return this.get('/subscriptions/status');
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);
