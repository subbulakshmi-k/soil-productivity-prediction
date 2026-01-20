// API Configuration
export const API_CONFIG = {
  // Use relative URLs for API routes to avoid CORS issues
  // These will be handled by Next.js API routes
  BASE_URL: '',
  
  // API endpoints - these now point to our Next.js API routes
  ENDPOINTS: {
    HEALTH: '/api/health',
    PREDICT: '/api/predict',
    SOIL_TYPES: '/api/soil-types',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
}

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  // For client-side requests, use relative URLs to avoid CORS
  if (typeof window !== 'undefined') {
    return endpoint;
  }
  // For server-side requests, use the full URL if provided, or default to localhost
  return process.env.NEXT_PUBLIC_API_URL ? 
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}` : 
    `http://localhost:3000${endpoint}`;
}
