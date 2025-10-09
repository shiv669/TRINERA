/**
 * API Configuration
 * Automatically uses production or development URLs based on environment
 */

// Get API URL from environment variable or use localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Convert HTTP URL to WebSocket URL (http -> ws, https -> wss)
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export const config = {
  // REST API base URL
  apiUrl: API_BASE_URL,
  
  // WebSocket base URL
  wsUrl: WS_BASE_URL,
  
  // API endpoints
  endpoints: {
    pestDetection: `${API_BASE_URL}/api/detect-pest`,
    chat: `${API_BASE_URL}/api/chat`,
    liveMode: (sessionId: string) => `${WS_BASE_URL}/api/ws/live/${sessionId}`,
    health: `${API_BASE_URL}/health`,
    docs: `${API_BASE_URL}/docs`,
  },
  
  // Environment info
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Helper function to log configuration (only in development)
if (config.isDevelopment && typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    environment: process.env.NODE_ENV,
  });
}

export default config;
