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
    return this.request<{ message: string }>('/Form_proceso', {
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

  // ✅ MÉTODOS PARA MANEJO DE BORRADORES
  async saveDraft(formData: any, formId?: string): Promise<ApiResponse<any>> {
    try {
      console.log('💾 Saving draft...', { formId, hasData: !!formData });
      
      const draftData = {
        formData,
        isDraft: true,
        lastModified: new Date().toISOString(),
        formId: formId || null
      };
      
      // Guardar en localStorage como backup
      const draftKey = formId ? `draft_edit_${formId}` : 'draft_new_form';
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      // Si es un formulario existente (edición), usar PUT con flag de draft
      if (formId) {
        const requestBody = {
          id: formId,
          formData,
          problems: formData.problems || [],
          isDraft: true
        };
        
        const result = await this.request('/Form_proceso', {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        });
        
        console.log('✅ Draft saved successfully');
        return result;
      } else {
        // Para formularios nuevos, solo guardar en localStorage por ahora
        console.log('✅ New form draft saved to localStorage');
        return {
          success: true,
          data: { saved: true, location: 'localStorage' },
          message: 'Borrador guardado localmente'
        };
      }
      
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      
      // Fallback: siempre guardar en localStorage si falla la API
      const draftKey = formId ? `draft_edit_${formId}` : 'draft_new_form';
      const fallbackData = {
        formData,
        isDraft: true,
        lastModified: new Date().toISOString(),
        formId: formId || null,
        savedToAPI: false
      };
      localStorage.setItem(draftKey, JSON.stringify(fallbackData));
      
      return {
        success: true,
        data: { saved: true, location: 'localStorage', error: (error as Error).message },
        message: 'Borrador guardado localmente (sin conexión)'
      };
    }
  }

  loadDraft(formId?: string): any | null {
    try {
      const draftKey = formId ? `draft_edit_${formId}` : 'draft_new_form';
      const draftJson = localStorage.getItem(draftKey);
      
      if (!draftJson) return null;
      
      const draft = JSON.parse(draftJson);
      console.log('📂 Draft loaded:', { formId, hasData: !!draft.formData });
      
      return draft;
    } catch (error) {
      console.error('❌ Error loading draft:', error);
      return null;
    }
  }

  clearDraft(formId?: string): void {
    try {
      const draftKey = formId ? `draft_edit_${formId}` : 'draft_new_form';
      localStorage.removeItem(draftKey);
      console.log('🗑️ Draft cleared:', draftKey);
    } catch (error) {
      console.error('❌ Error clearing draft:', error);
    }
  }

  hasDraft(formId?: string): boolean {
    try {
      const draftKey = formId ? `draft_edit_${formId}` : 'draft_new_form';
      return localStorage.getItem(draftKey) !== null;
    } catch (error) {
      console.error('❌ Error checking draft:', error);
      return false;
    }
  }

  // ✅ MÉTODO PARA ACTUALIZAR SOLO EL ESTADO DE UN FORMULARIO
  async updateFormStatus(formId: string, newStatus: 'Completado' | 'En Revisión' | 'Pendiente'): Promise<ApiResponse<ProcessForm>> {
    try {
      console.log('🔄 Actualizando estado del formulario:', { formId, newStatus });
      
      // Primero, obtener el formulario actual
      const currentFormResponse = await this.getFormById(formId);
      if (!currentFormResponse.success || !currentFormResponse.data) {
        throw new Error('Formulario no encontrado');
      }
      
      const currentForm = currentFormResponse.data;
      
      // Crear los datos de actualización con el nuevo estado
      const updateData = {
        id: formId,
        formData: {
          // Mantener todos los datos existentes del formulario
          ...currentForm,
          // ⭐ CRÍTICO: Excluir campos del sistema para evitar duplicación
          id: undefined,
          timestamp: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          source: undefined,
          version: undefined,
          updateCount: undefined,
          estado: undefined // No incluir en formData, se maneja por separado
        },
        problems: currentForm.problems || [],
        // ⭐ NUEVO: Agregar el estado específicamente
        estado: newStatus
      };
      
      console.log('📝 Datos de actualización preparados:', {
        formId,
        newStatus,
        hasFormData: !!updateData.formData,
        estadoEspecifico: updateData.estado
      });
      
      // ⭐ FIX: Agregar la ruta /Form_proceso al endpoint
      const response = await fetch(`${API_BASE_URL}/Form_proceso`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Estado del formulario actualizado exitosamente:', formId);
        return {
          success: true,
          data: { ...currentForm, estado: newStatus }, // ⭐ Retornar con el nuevo estado
          message: 'Estado actualizado correctamente'
        };
      } else {
        throw new Error(result.message || 'Error desconocido al actualizar el estado');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando estado del formulario:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : String(error)
      };
    }
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