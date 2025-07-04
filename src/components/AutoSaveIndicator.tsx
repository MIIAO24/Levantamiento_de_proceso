import React from 'react';
import { CheckCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error?: string | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  className = ''
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) {
      return 'hace unos segundos';
    } else if (diffMinutes === 1) {
      return 'hace 1 minuto';
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes} minutos`;
    } else {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (error) {
    return (
      <div className={`${className}`}>
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Error al guardar:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Guardando cambios...</span>
        </div>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-orange-600 text-sm">
          <Clock className="h-4 w-4" />
          <span>Cambios sin guardar</span>
        </div>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>Guardado {formatLastSaved(lastSaved)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Save className="h-4 w-4" />
        <span>Sin cambios</span>
      </div>
    </div>
  );
};

export default AutoSaveIndicator;
