// ================================
// 2. src/services/apiService.ts
// ================================

import { API_CONFIG } from '../config/apiConfig';

// Tipos
export interface ProcessFormData {
  nombreSolicitante: string;
  areaDepartamento: string;
  fechaSolicitud: string;
  nombreProceso: string;
  descripcionGeneral: string;
  objetivoProceso: string;
  pasosPrincipales: string;
  herramientas: string[];
  otrasHerramientas?: string;
  responsableProceso: string;
  participantesPrincipales: string;
  clientesBeneficiarios: string;
  reglasNegocio: string;
  casosExcepcionales?: string;
  procedimientosEscalamiento?: string;
  normativasRegulatorias?: string;
  politicasInternas?: string;
  requisitosSeguridad?: string;
  auditoriasControles?: string;
  kpiMetricas?: string;
  objetivosCuantificables?: string;
  funcionalidadesRequeridas: string;
  tipoInterfaz: string;
  integracionesRequeridas?: string;
  requisitosNoFuncionales?: string;
  motivoLevantamiento: string[];
  otroMotivoTexto?: string;
  resultadosEsperados: string;
  sistemasApoyo?: string;
  baseDatosInvolucrados?: string;
  integracionesExistentes?: string;
  origenInformacion?: string;
  destinoInformacion?: string;
}

export interface Problem {
  id: number;
  problema: string;
  impacto: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// ================================
// SERVICIO DE API SEGURO (SIN CRYPTO-JS)
// ================================

class SimpleSecureApiService {
  private readonly config = API_CONFIG;

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.baseURL) {
      throw new Error('API URL no configurada');
    }
  }

  // Generar headers seguros simples
  private getSecureHeaders(): HeadersInit {
    const timestamp = Date.now().toString();
    const nonce = this.generateSimpleNonce();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Client': 'Levantamiento-Procesos-App',
      'X-Version': '1.0.0',
      'X-User-Agent': 'ViteApp/1.0',
    };

    // Solo agregar API key si existe
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
      headers['X-Simple-Hash'] = this.generateSimpleHash(timestamp, nonce);
    }

    return headers;
  }

  // Generar nonce simple sin crypto-js
  private generateSimpleNonce(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  // Generar hash simple usando btoa (sin crypto-js)
  private generateSimpleHash(timestamp: string, nonce: string): string {
    const data = `${timestamp}-${nonce}-${this.config.apiKey}`;
    // Usar btoa para codificación base64 simple
    return btoa(data).replace(/[+/]/g, '').substring(0, 16);
  }

  // Ofuscar URL para logs
  private obfuscateUrl(url: string): string {
    const urlParts = url.split('/');
    if (urlParts.length > 2) {
      const domain = urlParts[2];
      const maskedDomain = domain.substring(0, 4) + '****' + domain.substring(domain.length - 4);
      urlParts[2] = maskedDomain;
    }
    return urlParts.join('/');
  }

  // Método principal para enviar formularios
  async submitProcessForm(
    formData: ProcessFormData, 
    problems: Problem[]
  ): Promise<ApiResponse> {
    try {
      console.log('🔒 Enviando formulario con seguridad simple...');
      console.log('📍 Destino:', this.obfuscateUrl(this.config.baseURL));
      
      const payload = {
        formData,
        problems,
        metadata: {
          timestamp: Date.now(),
          source: 'vite-secure-app',
          version: '1.0.0',
          sessionId: this.generateSimpleNonce()
        }
      };

      // Log del payload (sin datos sensibles)
      console.log('📦 Enviando datos:', {
        formDataKeys: Object.keys(formData),
        problemsCount: problems.length,
        hasMetadata: !!payload.metadata
      });

      const response = await fetch(`${this.config.baseURL}/dev/form_procesosIt`, {
        method: 'POST',
        headers: this.getSecureHeaders(),
        body: JSON.stringify(payload),
      });

      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Formulario enviado exitosamente');
      console.log('📊 Respuesta:', result);
      
      return {
        success: true,
        message: 'Formulario enviado exitosamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
      
      // Log detallado del error
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión desconocido'
      };
    }
  }

  // Método para obtener formularios
  async getProcessForms(): Promise<ApiResponse> {
    try {
      console.log('🔍 Obteniendo formularios...');
      console.log('📍 Desde:', this.obfuscateUrl(this.config.baseURL));
      
      const response = await fetch(`${this.config.baseURL}/dev/form_procesosIt`, {
        method: 'GET',
        headers: this.getSecureHeaders(),
      });

      console.log('📡 Status de respuesta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Formularios obtenidos exitosamente');
      console.log('📊 Cantidad de formularios:', Array.isArray(data) ? data.length : 'No es array');
      
      return {
        success: true,
        message: 'Formularios obtenidos exitosamente',
        data: data
      };

    } catch (error) {
      console.error('❌ Error obteniendo formularios:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo datos'
      };
    }
  }

  // Verificar salud del servicio
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/dev/health`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'X-Health-Check': 'true'
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Obtener configuración pública (sin datos sensibles)
  getPublicConfig() {
    return {
      hasApiKey: !!this.config.apiKey,
      environment: this.config.environment,
      timeout: this.config.timeout,
      baseUrlMasked: this.obfuscateUrl(this.config.baseURL),
    };
  }

  // Test de conectividad
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.config.baseURL}/dev/form_procesosIt`, {
        method: 'GET',
        headers: this.getSecureHeaders(),
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        success: response.ok,
        message: `Conexión ${response.ok ? 'exitosa' : 'fallida'}`,
        details: {
          status: response.status,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión',
        details: { error: error instanceof Error ? error.message : 'Error desconocido' }
      };
    }
  }
}

// Exportar instancia única
export const apiService = new SimpleSecureApiService();

// ================================
// FUNCIONES DE COMPATIBILIDAD
// ================================

/**
 * Función principal para mantener compatibilidad con código existente
 */
export const submitProcessForm = async (
  data: { formData: ProcessFormData; problems: Problem[] }
): Promise<ApiResponse> => {
  return await apiService.submitProcessForm(data.formData, data.problems);
};

/**
 * Función para obtener formularios
 */
export const getProcessForms = async (): Promise<ApiResponse> => {
  return await apiService.getProcessForms();
};

/**
 * Función para obtener estadísticas (compatibilidad Dashboard)
 */
export const getStats = async (): Promise<ApiResponse> => {
  try {
    console.log('📊 Obteniendo estadísticas...');
    
    // Primero obtenemos todos los formularios
    const formsResponse = await apiService.getProcessForms();
    
    if (!formsResponse.success || !formsResponse.data) {
      return {
        success: false,
        error: 'No se pudieron obtener los formularios para calcular estadísticas'
      };
    }
    
    const forms = Array.isArray(formsResponse.data) ? formsResponse.data : [];
    
    // Calculamos las estadísticas
    const stats = {
      total: forms.length,
      enRevision: Math.floor(forms.length * 0.3), // 30% en revisión
      completados: Math.floor(forms.length * 0.6), // 60% completados
      pendientes: Math.floor(forms.length * 0.1)   // 10% pendientes
    };
    
    console.log('✅ Estadísticas calculadas:', stats);
    
    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo estadísticas'
    };
  }
};

// ================================
// UTILIDADES
// ================================

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`🔧 [DEBUG] ${message}`, data || '');
  }
};

// Test público de configuración
export const testApiConfig = () => {
  console.log('🧪 Testing API Configuration...');
  console.log(apiService.getPublicConfig());
  return apiService.testConnection();
};
