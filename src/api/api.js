// API service import
import apiService, { API_ENDPOINTS } from '../services/apiService';

// Re-export for backward compatibility
export { apiService as default, API_ENDPOINTS };

// Legacy function exports (can be removed once all components are updated)
export const api = apiService;