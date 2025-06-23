// src/lib/apiService.ts
const API_BASE_URL = 'https://07mzej7fq9.execute-api.us-east-1.amazonaws.com/dev1'; // Reemplaza con tu URL real

export interface ProcessFormData {
  // Información general
  nombreSolicitante: string;
  areaDepartamento: string;
  fechaSolicitud: string;
  nombreProceso: string;
  
  // Descripción del proceso
  descripcionGeneral: string;
  objetivoProceso: string;
  pasosPrincipales: string;
  herramientas: string[];
  otrasHerramientas?: string;
  
  // Participantes
  responsableProceso: string;
  participantesPrincipales: string;
  clientesBeneficiarios: string;
  
  // Reglas de negocio
  reglasNegocio: string;
  casosExcepcionales?: string;
  procedimientosEscalamiento?: string;
  normativasRegulatorias?: string;
  politicasInternas?: string;
  requisitosSeguridad?: string;
  auditoriasControles?: string;
  
  // Métricas
  kpiMetricas?: string;
  objetivosCuantificables?: string;
  
  // Solución
  funcionalidadesRequeridas: string;
  tipoInterfaz: string;
  integracionesRequeridas?: string;
  requisitosNoFuncionales?: string;
  motivoLevantamiento: string[];
  otroMotivoTexto?: string;
  resultadosEsperados: string;
  
  // Información técnica
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

export interface SubmitProcessData {
  formData: ProcessFormData;
  problems: Problem[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const submitProcessForm = async (
  formData: ProcessFormData, 
  problems: Problem[]
): Promise<ApiResponse> => {
  try {
    const payload: SubmitProcessData = {
      formData,
      problems
    };

    const response = await fetch(`${API_BASE_URL}/Form_proceso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'Formulario enviado exitosamente',
      data: result
    };

  } catch (error) {
    console.error('API Error:', error);
    
    return {
      success: false,
      message: 'Error al enviar el formulario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función adicional para validar la conexión con la API
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Form_proceso`, {
      method: 'OPTIONS'
    });
    return response.ok;
  } catch (error) {
    console.error('API Connection Error:', error);
    return false;
  }
};