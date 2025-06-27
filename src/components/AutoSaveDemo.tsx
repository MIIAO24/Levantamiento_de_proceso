import React from 'react';
import AutoSaveIndicator from './AutoSaveIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AutoSaveDemo: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎭 Demo del Auto-Save Indicator</CardTitle>
          <p className="text-sm text-gray-600">
            Prueba todos los estados del indicador de guardado automático
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Estado: Sin cambios */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Sin cambios</h3>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={null}
              hasUnsavedChanges={false}
              error={null}
              className="bg-gray-50 px-4 py-2 rounded border"
            />
          </div>

          {/* Estado: Guardando */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Guardando</h3>
            <AutoSaveIndicator 
              isSaving={true}
              lastSaved={null}
              hasUnsavedChanges={false}
              error={null}
              className="bg-blue-50 px-4 py-2 rounded border"
            />
          </div>

          {/* Estado: Guardado recientemente */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Guardado recientemente</h3>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={new Date()}
              hasUnsavedChanges={false}
              error={null}
              className="bg-green-50 px-4 py-2 rounded border"
            />
          </div>

          {/* Estado: Guardado hace tiempo */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Guardado hace tiempo</h3>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={new Date(Date.now() - 5 * 60 * 1000)} // 5 minutos atrás
              hasUnsavedChanges={false}
              error={null}
              className="bg-green-50 px-4 py-2 rounded border"
            />
          </div>

          {/* Estado: Cambios sin guardar */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Cambios sin guardar</h3>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={new Date(Date.now() - 2 * 60 * 1000)} // 2 minutos atrás
              hasUnsavedChanges={true}
              error={null}
              className="bg-orange-50 px-4 py-2 rounded border"
            />
          </div>

          {/* Estado: Error */}
          <div>
            <h3 className="font-semibold mb-2">Estado: Error al guardar</h3>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={null}
              hasUnsavedChanges={true}
              error="No se pudo conectar con el servidor"
              className="px-4 py-2 rounded border"
            />
          </div>

          {/* Modo Demo Interactivo */}
          <div>
            <h3 className="font-semibold mb-2">🎮 Modo Demo Interactivo</h3>
            <p className="text-sm text-gray-600 mb-2">
              Haz clic en el botón para cambiar entre estados
            </p>
            <AutoSaveIndicator 
              isSaving={false}
              lastSaved={null}
              hasUnsavedChanges={false}
              error={null}
              className="bg-gray-50 px-4 py-2 rounded border"
              demoMode={true}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AutoSaveDemo;
