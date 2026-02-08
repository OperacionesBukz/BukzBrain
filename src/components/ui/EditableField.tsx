import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  multiline?: boolean;
  disabled?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

/**
 * Componente de input editable con estado local y guardado inteligente.
 * 
 * Características:
 * - Estado local para escritura fluida (sin re-renders externos)
 * - Debounce automático para guardar después de X segundos de inactividad
 * - Guardado inmediato en onBlur
 * - Protección contra actualizaciones externas mientras se edita
 * - Memoizado para evitar re-renders innecesarios
 */
const EditableField = memo(({
  value: externalValue,
  onSave,
  placeholder = '',
  className = '',
  debounceMs = 1500,
  multiline = false,
  disabled = false,
  onKeyPress,
  autoFocus = false,
}: EditableFieldProps) => {
  // Estado local del input - ESTO ES LA CLAVE para evitar pérdida de foco
  const [localValue, setLocalValue] = useState(externalValue);
  
  // Ref para trackear si el campo tiene foco
  const isFocusedRef = useRef(false);
  
  // Ref para el timeout del debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref para trackear el último valor guardado (evita guardados duplicados)
  const lastSavedValueRef = useRef(externalValue);
  
  // Ref para saber si hay un guardado pendiente
  const hasPendingSaveRef = useRef(false);

  /**
   * REGLA DE ORO: Solo sincronizar valor externo cuando:
   * 1. El campo NO tiene foco (el usuario no está editando)
   * 2. El valor externo cambió (otro usuario lo modificó vía Realtime)
   */
  useEffect(() => {
    if (!isFocusedRef.current && externalValue !== localValue) {
      setLocalValue(externalValue);
      lastSavedValueRef.current = externalValue;
    }
  }, [externalValue]); // Intencionalmente no incluimos localValue para evitar loops

  /**
   * Función para guardar - solo si el valor realmente cambió
   */
  const saveValue = useCallback(async (valueToSave: string) => {
    if (valueToSave !== lastSavedValueRef.current) {
      lastSavedValueRef.current = valueToSave;
      hasPendingSaveRef.current = false;
      try {
        await onSave(valueToSave);
      } catch (error) {
        console.error('Error al guardar:', error);
        // En caso de error, marcamos que necesita reintento
        hasPendingSaveRef.current = true;
      }
    }
  }, [onSave]);

  /**
   * Manejar cambio de texto - debounce para guardar
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    hasPendingSaveRef.current = true;

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Configurar nuevo debounce para guardar
    debounceTimeoutRef.current = setTimeout(() => {
      saveValue(newValue);
    }, debounceMs);
  }, [debounceMs, saveValue]);

  /**
   * Manejar foco - marcar que estamos editando
   */
  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  /**
   * Manejar blur - guardar inmediatamente y permitir actualizaciones externas
   */
  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    
    // Cancelar debounce pendiente y guardar inmediatamente
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Solo guardar si hay cambios pendientes
    if (hasPendingSaveRef.current) {
      saveValue(localValue);
    }
  }, [localValue, saveValue]);

  /**
   * Limpiar timeouts al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Props comunes para Input y Textarea
  const commonProps = {
    value: localValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    className,
    disabled,
    autoFocus,
    onKeyPress,
  };

  if (multiline) {
    return <Textarea {...commonProps} />;
  }

  return <Input {...commonProps} />;
});

EditableField.displayName = 'EditableField';

export { EditableField };
export default EditableField;
