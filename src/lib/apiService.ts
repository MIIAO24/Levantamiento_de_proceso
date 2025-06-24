// src/lib/apiService.ts
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
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
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

  // Obtener estadísticas
  async getStats(): Promise<ApiResponse<ProcessStats>> {
    return this.request<ProcessStats>('/stats');
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
