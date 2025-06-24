// src/services/apiService.ts
const API_BASE_URL = 'https://07mzej7fq9.execute-api.us-east-1.amazonaws.com/dev1';
export interface ProcessForm {
  id: string;
  nombreProceso: string;
  nombreSolicitante: string;
  areaDepartamento: string;
  fechaSolicitud: string;
  timestamp: string;
  createdAt: number;
  estado: 'Completado' | 'En Revisión' | 'Pendiente';
  descripcionGeneral?: string;
  objetivoProceso?: string;
  pasosPrincipales?: string;
  responsableProceso?: string;
  participantesPrincipales?: string;
  clientesBeneficiarios?: string;
  reglasNegocio?: string;
  funcionalidadesRequeridas?: string;
  tipoInterfaz?: string;
  motivoLevantamiento?: string[];
  resultadosEsperados?: string;
  herramientas?: string[];
  problems?: any[];
  [key: string]: any;
}

export interface ProcessStats {
  total: number;
  completados: number;
  enRevision: number;
  pendientes: number;
  porArea: Record<string, number>;
  recientes: Array<{
    id: string;
    nombreProceso: string;
    nombreSolicitante: string;
    timestamp: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 API Request:', { 
      fullUrl, 
      method: options.method || 'GET',
      endpoint 
    });

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('📡 API Response:', {
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', {
          url: fullUrl,
          status: response.status,
          data
        });
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API Success:', {
        url: fullUrl,
        dataKeys: Object.keys(data)
      });

      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${fullUrl}`, error);
      throw error;
    }
  }

  // Obtener todas las formas con filtros opcionales
  async getForms(params: {
    search?: string;
    status?: string;
    limit?: number;
    lastKey?: string;
  } = {}): Promise<ApiResponse<{
    items: ProcessForm[];
    total: number;
    count: number;
    lastKey?: string;
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.lastKey) queryParams.append('lastKey', params.lastKey);

    const endpoint = `/Form_proceso${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{
      items: ProcessForm[];
      total: number;
      count: number;
      lastKey?: string;
    }>(endpoint);
  }

  // Obtener una forma específica por ID
  async getFormById(id: string): Promise<ApiResponse<ProcessForm>> {
    return this.request<ProcessForm>(`/Form_proceso?id=${id}`);
  }

  // Obtener estadísticas (usando endpoint existente)
  async getStats(): Promise<ApiResponse<ProcessStats>> {
    try {
      // Primero obtenemos todos los formularios
      const formsResponse = await this.getForms({ limit: 100 });
      
      if (!formsResponse.success) {
        throw new Error(formsResponse.message || 'Error al obtener formularios');
      }

      const forms = formsResponse.data.items;
      
      // Calcular estadísticas localmente
      const stats: ProcessStats = {
        total: forms.length,
        completados: forms.filter(f => f.estado === 'Completado').length,
        enRevision: forms.filter(f => f.estado === 'En Revisión').length,
        pendientes: forms.filter(f => f.estado === 'Pendiente').length,
        porArea: {},
        recientes: forms
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 5)
          .map(form => ({
            id: form.id,
            nombreProceso: form.nombreProceso,
            nombreSolicitante: form.nombreSolicitante,
            timestamp: form.timestamp
          }))
      };

      // Calcular distribución por área
      forms.forEach(form => {
        const area = form.areaDepartamento || 'Sin área';
        stats.porArea[area] = (stats.porArea[area] || 0) + 1;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      throw error;
    }
  }

  // Crear nueva forma
  async createForm(formData: any): Promise<ApiResponse<{
    id: string;
    timestamp: string;
    processName: string;
    savedToDatabase: boolean;
  }>> {
    return this.request(`/Form_proceso`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Eliminar forma (implementar en Lambda si es necesario)
  async deleteForm(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/Form_proceso`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Probar conexión con la base de datos
  async testConnection(): Promise<ApiResponse<{
    success: boolean;
    tableStatus: string;
    itemCount: number;
    message: string;
    tableName: string;
  }>> {
    return this.request('/test-db');
  }
}

// Hook personalizado para usar el servicio
export const useApiService = () => {
  return new ApiService();
};

export default new ApiService();
