// src/services/apiService.ts
const API_BASE_URL = 'https://07mzej7fq9.execute-api.us-east-1.amazonaws.com/dev1';

// ✅ INTERFACE CORREGIDA - campos opcionales para máxima flexibilidad
export interface ProcessFormSubmission {
  formData: {
    nombreSolicitante?: string;
    areaDepartamento?: string;
    fechaSolicitud?: string;
    nombreProceso?: string;
    descripcionGeneral?: string;
    objetivoProceso?: string;
    pasosPrincipales?: string;
    herramientas?: string[];
    otrasHerramientas?: string;
    responsableProceso?: string;
    participantesPrincipales?: string;
    clientesBeneficiarios?: string;
    reglasNegocio?: string;
    casosExcepcionales?: string;
    procedimientosEscalamiento?: string;
    normativasRegulatorias?: string;
    politicasInternas?: string;
    requisitosSeguridad?: string;
    auditoriasControles?: string;
    kpiMetricas?: string;
    objetivosCuantificables?: string;
    funcionalidadesRequeridas?: string;
    tipoInterfaz?: string;
    integracionesRequeridas?: string;
    requisitosNoFuncionales?: string;
    motivoLevantamiento?: string[];
    otroMotivoTexto?: string;
    resultadosEsperados?: string;
    sistemasApoyo?: string;
    baseDatosInvolucrados?: string;
    integracionesExistentes?: string;
    origenInformacion?: string;
    destinoInformacion?: string;
  };
  problems?: Array<{
    id: number;
    problema: string;
    impacto: string;
  }>;
}

// ✅ INTERFACE PARA ACTUALIZACIÓN - también con campos opcionales
export interface ProcessFormUpdate {
  id: string;
  formData: {
    nombreSolicitante?: string;
    areaDepartamento?: string;
    fechaSolicitud?: string;
    nombreProceso?: string;
    descripcionGeneral?: string;
    objetivoProceso?: string;
    pasosPrincipales?: string;
    herramientas?: string[];
    otrasHerramientas?: string;
    responsableProceso?: string;
    participantesPrincipales?: string;
    clientesBeneficiarios?: string;
    reglasNegocio?: string;
    casosExcepcionales?: string;
    procedimientosEscalamiento?: string;
    normativasRegulatorias?: string;
    politicasInternas?: string;
    requisitosSeguridad?: string;
    auditoriasControles?: string;
    kpiMetricas?: string;
    objetivosCuantificables?: string;
    funcionalidadesRequeridas?: string;
    tipoInterfaz?: string;
    integracionesRequeridas?: string;
    requisitosNoFuncionales?: string;
    motivoLevantamiento?: string[];
    otroMotivoTexto?: string;
    resultadosEsperados?: string;
    sistemasApoyo?: string;
    baseDatosInvolucrados?: string;
    integracionesExistentes?: string;
    origenInformacion?: string;
    destinoInformacion?: string;
  };
  problems?: Array<{
    id: number;
    problema: string;
    impacto: string;
  }>;
  timestamp: string;
  updatedAt: string;
}

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
  private async request<T>(endpoint: string = '', options: RequestInit = {}): Promise<ApiResponse<T>> {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    // ✅ FIX: Convertir body a string antes de hacer substring
    const bodyString = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    const bodyPreview = bodyString ? bodyString.substring(0, 100) + '...' : 'none';
    
    console.log('🌐 API Request:', { 
      fullUrl, 
      method: options.method || 'GET',
      endpoint,
      bodyPreview
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

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ Error parsing JSON response:', jsonError);
        throw new Error(`Error parsing response: ${response.status} ${response.statusText}`);
      }
      
      console.log('📥 Response Data:', data);
      
      if (!response.ok) {
        console.error('❌ API Error:', {
          url: fullUrl,
          status: response.status,
          data
        });
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API Success:', {
        url: fullUrl,
        dataKeys: data ? Object.keys(data) : []
      });

      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${fullUrl}`, error);
      throw error;
    }
  }

  // ✅ FUNCIÓN CORREGIDA - usar el tipo correcto
  async submitProcessForm(submission: ProcessFormSubmission): Promise<ApiResponse<{
    id: string;
    timestamp: string;
    processName: string;
    savedToDatabase: boolean;
  }>> {
    console.log('📝 Submitting process form:', {
      formDataKeys: Object.keys(submission.formData),
      problemsCount: submission.problems?.length || 0,
      nombreProceso: submission.formData.nombreProceso
    });
    
    return this.request('/Form_proceso', {
      method: 'POST',
      body: JSON.stringify(submission), // ✅ Enviar toda la estructura
    });
  }

  // ✅ FUNCIÓN PARA ACTUALIZAR FORMULARIOS
  async updateProcessForm(updateData: ProcessFormUpdate): Promise<ApiResponse<{
    id: string;
    timestamp: string;
    processName: string;
    updated: boolean;
    message: string;
  }>> {
    console.log('🔄 Updating process form:', {
      id: updateData.id,
      formDataKeys: Object.keys(updateData.formData),
      problemsCount: updateData.problems?.length || 0,
      nombreProceso: updateData.formData.nombreProceso
    });
    
    return this.request('/Form_proceso', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
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

  // Obtener estadísticas desde el endpoint /stats
  async getStats(): Promise<ApiResponse<ProcessStats>> {
    return this.request<ProcessStats>('/stats');
  }

  // ✅ FUNCIÓN CORREGIDA - usar el tipo correcto
  async createForm(submission: ProcessFormSubmission): Promise<ApiResponse<{
    id: string;
    timestamp: string;
    processName: string;
    savedToDatabase: boolean;
  }>> {
    return this.submitProcessForm(submission);
  }

  // ✅ FUNCIÓN PARA ACTUALIZAR (alias más claro)
  async updateForm(id: string, updateData: any): Promise<ApiResponse<{
    id: string;
    timestamp: string;
    processName: string;
    updated: boolean;
    message: string;
  }>> {
    console.log('🔄 Sending PUT request with data:', {
      id,
      formDataKeys: Object.keys(updateData.formData || {}),
      problemsCount: (updateData.problems || []).length,
      hasId: !!updateData.id
    });
    
    // Enviar directamente el updateData que ya incluye el id, formData y problems
    return this.request('/Form_proceso', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Eliminar forma (implementar en Lambda si es necesario)
  async deleteForm(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('', {
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

  // Obtener un formulario por ID
  async getProcessFormById(id: string): Promise<ProcessForm> {
    const res = await this.request<ProcessForm>(`/Form_proceso?id=${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error('No se encontró el formulario');
  }
}

// Instancia por defecto
const apiService = new ApiService();

// ✅ EXPORTAR FUNCIÓN CORREGIDA
export const submitProcessForm = (submission: ProcessFormSubmission) => 
  apiService.submitProcessForm(submission);

// ✅ NUEVA EXPORTACIÓN PARA ACTUALIZAR
export const updateProcessForm = (updateData: ProcessFormUpdate) => 
  apiService.updateProcessForm(updateData);

export const getProcessForms = (params?: any) => apiService.getForms(params);
export const getStats = () => apiService.getStats();

// Hook personalizado para usar el servicio
export const useApiService = () => {
  return apiService;
};

export { apiService };
export default apiService;