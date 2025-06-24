// ================================
// 1. src/config/apiConfig.ts
// ================================

// Configuración centralizada de API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  environment: import.meta.env.VITE_APP_ENV,
  timeout: 10000,
} as const;

// Validación de configuración
if (!API_CONFIG.baseURL) {
  throw new Error('❌ VITE_API_URL no está configurada en las variables de entorno');
}

if (!API_CONFIG.apiKey) {
  console.warn('⚠️ VITE_API_KEY no está configurada');
}

// Log de configuración (solo en desarrollo)
if (API_CONFIG.environment === 'development') {
  console.log('🔧 API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    hasApiKey: !!API_CONFIG.apiKey,
    environment: API_CONFIG.environment,
  });
}
