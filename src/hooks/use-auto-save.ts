import { useEffect, useRef, useCallback } from 'react';

// Función debounce personalizada sin dependencias externas
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = ((...args: Parameters<T>) => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  }) as T & { cancel: () => void; flush: () => void };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFunction.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFunction;
}

interface UseAutoSaveOptions {
  delay?: number; // Tiempo en ms antes de guardar
  enabled?: boolean; // Si el auto-save está habilitado
  onSave: (data: any) => Promise<void>; // Función que guarda los datos
  onError?: (error: Error) => void; // Función para manejar errores
}

interface UseAutoSaveReturn {
  saveNow: () => Promise<void>; // Función para guardar inmediatamente
  isSaving: boolean; // Estado de guardado
  lastSaved: Date | null; // Última vez que se guardó
  hasUnsavedChanges: boolean; // Si hay cambios sin guardar
}

export const useAutoSave = (
  data: any,
  options: UseAutoSaveOptions
): UseAutoSaveReturn => {
  const {
    delay = 3000, // 3 segundos por defecto
    enabled = true,
    onSave,
    onError
  } = options;

  const lastSavedDataRef = useRef<any>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const hasUnsavedChangesRef = useRef(false);

  // Función de guardado con debounce
  const debouncedSave = useCallback(
    debounce(async (dataToSave: any) => {
      if (!enabled || isSavingRef.current) return;

      try {
        isSavingRef.current = true;
        console.log('🔄 Auto-saving data...', new Date().toLocaleTimeString());
        
        await onSave(dataToSave);
        
        lastSavedDataRef.current = JSON.parse(JSON.stringify(dataToSave));
        lastSavedRef.current = new Date();
        hasUnsavedChangesRef.current = false;
        
        console.log('✅ Auto-save successful', lastSavedRef.current.toLocaleTimeString());
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        isSavingRef.current = false;
      }
    }, delay),
    [delay, enabled, onSave, onError]
  );

  // Función para guardar inmediatamente
  const saveNow = useCallback(async () => {
    debouncedSave.cancel(); // Cancelar guardado pendiente
    await debouncedSave.flush(); // Ejecutar inmediatamente
  }, [debouncedSave]);

  // Efecto para detectar cambios y activar auto-save
  useEffect(() => {
    if (!enabled || !data) return;

    const currentDataString = JSON.stringify(data);
    const lastSavedDataString = JSON.stringify(lastSavedDataRef.current);

    // Solo guardar si hay cambios reales
    if (currentDataString !== lastSavedDataString && lastSavedDataRef.current !== null) {
      hasUnsavedChangesRef.current = true;
      debouncedSave(data);
    } else if (lastSavedDataRef.current === null) {
      // Primera carga, establecer datos iniciales sin guardar
      lastSavedDataRef.current = JSON.parse(JSON.stringify(data));
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    saveNow,
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current
  };
};

export default useAutoSave;
