// ================================
// pages/api/get-forms.ts
// ================================

import type { NextApiRequest, NextApiResponse } from 'next';

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
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se acepta GET.'
    });
  }

  // Validar configuración
  const LAMBDA_URL = process.env.LAMBDA_API_URL;
  if (!LAMBDA_URL) {
    console.error('LAMBDA_API_URL no configurada');
    return res.status(500).json({
      success: false,
      error: 'Configuración del servidor incompleta'
    });
  }

  try {
    console.log('🔍 Proxy API: Obteniendo formularios...');
    console.log('📍 URL destino:', LAMBDA_URL);

    // Hacer petición a Lambda para obtener formularios
    const response = await fetch(`${LAMBDA_URL}/dev/form_procesosIt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_SECRET_KEY || '',
        'User-Agent': 'Sistema-Levantamiento-Procesos/1.0',
      },
    });

    console.log('📡 Respuesta de Lambda - Status:', response.status);

    if (!response.ok) {
      throw new Error(`Lambda respondió con error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Formularios obtenidos exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Formularios obtenidos exitosamente',
      data: data
    });

  } catch (error) {
    console.error('❌ Error obteniendo formularios:', error);
    
    let errorMessage = 'Error obteniendo formularios';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con el servicio';
        statusCode = 503;
      } else if (error.message.includes('Lambda respondió')) {
        errorMessage = 'Error en el servicio de datos';
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
