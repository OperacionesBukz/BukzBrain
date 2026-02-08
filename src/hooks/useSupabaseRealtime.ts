import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeOptions<T> {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T, oldRecord: Partial<T>) => void;
  onDelete?: (oldRecord: Partial<T>) => void;
  /**
   * Callback para verificar si un registro está siendo editado localmente.
   * Si retorna true, la actualización de Realtime NO se aplicará a ese campo.
   */
  isRecordBeingEdited?: (recordId: string) => boolean;
  /**
   * Campos a ignorar durante actualizaciones si el registro está siendo editado.
   * Por defecto: ['text', 'notes', 'content', 'description']
   */
  editableFields?: string[];
}

interface UseRealtimeReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: Error | null;
}

/**
 * Hook para suscribirse a cambios en tiempo real de Supabase.
 * 
 * Características:
 * - Conexión automática y limpieza al desmontar
 * - Manejo de reconexión automática
 * - Protección de campos editados (no sobrescribe mientras el usuario edita)
 * - Logging detallado para debugging
 */
export function useSupabaseRealtime<T extends { id: string }>({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  isRecordBeingEdited,
  editableFields = ['text', 'notes', 'content', 'description'],
}: UseRealtimeOptions<T>): UseRealtimeReturn {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Procesar actualizaciones de Realtime
   */
  const handleRealtimeChange = useCallback((
    payload: RealtimePostgresChangesPayload<T>
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔥 [${timestamp}] REALTIME: ${payload.eventType}`);
    console.log('📋 Tabla:', table);
    
    switch (payload.eventType) {
      case 'INSERT':
        console.log('➕ Nuevo registro:', payload.new);
        onInsert?.(payload.new as T);
        break;

      case 'UPDATE':
        const newRecord = payload.new as T;
        const oldRecord = payload.old as Partial<T>;
        
        console.log('📝 Registro actualizado:', newRecord.id);
        
        // Verificar si el registro está siendo editado localmente
        if (isRecordBeingEdited?.(newRecord.id)) {
          console.log('⚠️ Registro siendo editado localmente - fusionando selectivamente');
          
          // Crear una versión filtrada que excluye campos editables
          const filteredRecord = { ...newRecord };
          editableFields.forEach(field => {
            if (field in filteredRecord) {
              delete (filteredRecord as any)[field];
            }
          });
          
          // Solo actualizar campos no editables
          onUpdate?.(filteredRecord as T, oldRecord);
        } else {
          onUpdate?.(newRecord, oldRecord);
        }
        break;

      case 'DELETE':
        console.log('🗑️ Registro eliminado:', payload.old);
        onDelete?.(payload.old as Partial<T>);
        break;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [table, onInsert, onUpdate, onDelete, isRecordBeingEdited, editableFields]);

  /**
   * Configurar suscripción a Realtime
   */
  useEffect(() => {
    const channelName = `${table}-realtime-${Date.now()}`;
    
    console.log('📡 Iniciando conexión Realtime para:', table);
    setConnectionStatus('connecting');

    // Configurar canal
    const channel = supabase.channel(channelName);
    
    // Configurar listener de cambios
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema,
        table,
        ...(filter && { filter }),
      },
      handleRealtimeChange as any
    );

    // Suscribirse
    channel.subscribe((status, err) => {
      console.log(`📊 Estado de suscripción [${table}]:`, status);
      
      if (err) {
        console.error('❌ Error de Realtime:', err);
        setError(new Error(err.message));
        setConnectionStatus('error');
        
        // Intentar reconexión después de 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Intentando reconexión...');
          channel.unsubscribe();
          // El useEffect se volverá a ejecutar al cambiar alguna dependencia
        }, 5000);
        
        return;
      }

      switch (status) {
        case 'SUBSCRIBED':
          console.log('✅ Realtime CONECTADO para:', table);
          setConnectionStatus('connected');
          setError(null);
          break;
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
          console.warn('⚠️ Problema de conexión:', status);
          setConnectionStatus('error');
          break;
        case 'CLOSED':
          console.log('🔌 Canal cerrado');
          setConnectionStatus('disconnected');
          break;
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('🔌 Limpiando conexión Realtime para:', table);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, filter, handleRealtimeChange]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    error,
  };
}

export default useSupabaseRealtime;
