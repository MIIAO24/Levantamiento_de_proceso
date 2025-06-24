// ================================
// pages/api/submit-form.ts
// ================================

import type { NextApiRequest, NextApiResponse } from 'next';

// Tipos para la respuesta
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se acepta POST.'
    });
  }

  // Validar que exista la URL de la Lambda
  const LAMBDA_URL = process.env.LAMBDA_API_URL;
  if (!LAMBDA_URL) {
    console.error('LAMBDA_API_URL no configurada en variables de entorno');
    return res.status(500).json({
      success: false,
      error: 'Configuración del servidor incompleta'
    });
  }

  try {
    console.log('🚀 Proxy API: Enviando datos a Lambda...');
    console.log('📍 URL destino:', LAMBDA_URL);
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));

    // Hacer la petición real a la Lambda
    const response = await fetch(`${LAMBDA_URL}/dev/form_procesosIt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Agregar headers de seguridad
        'X-API-Key': process.env.API_SECRET_KEY || '',
        'User-Agent': 'Sistema-Levantamiento-Procesos/1.0',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      },
      body: JSON.stringify(req.body),
    });

    console.log('📡 Respuesta de Lambda - Status:', response.status);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Lambda respondió con error: ${response.status} ${response.statusText}`);
    }

    // Obtener los datos de respuesta
    const data = await response.json();
    
    console.log('✅ Datos recibidos de Lambda:', data);

    // Enviar respuesta exitosa al frontend
    return res.status(200).json({
      success: true,
      message: 'Formulario enviado exitosamente',
      data: data
    });

  } catch (error) {
    console.error('❌ Error en Proxy API:', error);
    
    // Determinar el tipo de error
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con el servicio';
        statusCode = 503;
      } else if (error.message.includes('Lambda respondió')) {
        errorMessage = 'Error en el servicio de procesamiento';
        statusCode = 502;
      } else {
        errorMessage = error.message;
      }
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}

// ================================
// pages/api/get-forms.ts (para obtener formularios)
// ================================

export async function getFormsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se acepta GET.'
    });
  }

  const LAMBDA_URL = process.env.LAMBDA_API_URL;
  if (!LAMBDA_URL) {
    return res.status(500).json({
      success: false,
      error: 'Configuración del servidor incompleta'
    });
  }

  try {
    console.log('🔍 Proxy API: Obteniendo formularios...');

    const response = await fetch(`${LAMBDA_URL}/dev/form_procesosIt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_SECRET_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Lambda respondió con error: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('❌ Error obteniendo formularios:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error obteniendo formularios'
    });
  }
}
