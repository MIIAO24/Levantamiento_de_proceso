// src/lib/apiService.ts
const API_BASE_URL = 'https://07mzej7fq9.execute-api.us-east-1.amazonaws.com/dev1';

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
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  statusCode?: number;
}

export const submitProcessForm = async (
  formData: ProcessFormData, 
  problems: Problem[]
): Promise<ApiResponse> => {
  try {
    // Agregar timestamp e información adicional
    const payload: SubmitProcessData = {
      formData,
      problems,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando datos a API:', {
      url: `${API_BASE_URL}/Form_proceso`,
      payload: payload
    });

    const response = await fetch(`${API_BASE_URL}/Form_proceso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Respuesta de API recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Intentar parsear la respuesta
    let result;
    const responseText = await response.text();
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('No se pudo parsear respuesta como JSON:', responseText);
      result = { message: responseText };
    }

    console.log('Resultado parseado:', result);

    if (!response.ok) {
      throw new Error(
        result?.message || 
        result?.error || 
        `Error HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    return {
      success: true,
      message: result?.message || 'Formulario enviado exitosamente',
      data: result,
      statusCode: response.status
    };

  } catch (error) {
    console.error('Error en submitProcessForm:', error);
    
    // Manejo específico de errores
    let errorMessage = 'Error desconocido al enviar el formulario';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifique su conexión a internet y la configuración de CORS.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: 'Error al enviar el formulario',
      error: errorMessage
    };
  }
};

// Función para validar la conexión con la API
export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Probando conexión con API...');
    
    const response = await fetch(`${API_BASE_URL}/Form_proceso`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Respuesta de test de conexión:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      return {
        success: true,
        message: 'Conexión exitosa con la API',
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } else {
      return {
        success: false,
        message: `Error de conexión: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    console.error('Error al probar conexión con API:', error);
    
    return {
      success: false,
      message: 'No se pudo conectar con la API',
      details: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función utilitaria para validar datos antes del envío
export const validateFormData = (data: ProcessFormData, problems: Problem[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Validaciones básicas
  if (!data.nombreSolicitante?.trim()) {
    errors.push('Nombre del solicitante es requerido');
  }
  
  if (!data.nombreProceso?.trim()) {
    errors.push('Nombre del proceso es requerido');
  }
  
  if (!data.herramientas || data.herramientas.length === 0) {
    errors.push('Debe seleccionar al menos una herramienta');
  }
  
  if (!data.motivoLevantamiento || data.motivoLevantamiento.length === 0) {
    errors.push('Debe seleccionar al menos un motivo de levantamiento');
  }
  
  // Validar que los problemas tengan contenido si se agregaron
  if (problems.length > 0) {
    const emptyProblems = problems.filter(p => !p.problema.trim() && !p.impacto.trim());
    if (emptyProblems.length === problems.length) {
      // Todos los problemas están vacíos, eso está bien
    } else {
      // Hay algunos problemas con contenido, validar que estén completos
      const incompleteProblems = problems.filter(p => 
        (p.problema.trim() && !p.impacto.trim()) || 
        (!p.problema.trim() && p.impacto.trim())
      );
      
      if (incompleteProblems.length > 0) {
        errors.push('Los problemas deben tener tanto descripción como impacto');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para formatear datos antes del envío (opcional)
export const formatFormData = (data: ProcessFormData): ProcessFormData => {
  return {
    ...data,
    // Limpiar espacios en blanco
    nombreSolicitante: data.nombreSolicitante?.trim(),
    nombreProceso: data.nombreProceso?.trim(),
    descripcionGeneral: data.descripcionGeneral?.trim(),
    // Agregar más formateo según sea necesario
  };
};
