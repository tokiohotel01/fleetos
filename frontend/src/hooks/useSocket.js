import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
export const useSocket = ({ onPosicion, onAlerta, onPanico, onMensaje } = {}) => {
  const ref = useRef(null);
  const { user, token } = useSelector(s => s.auth);
  useEffect(() => {
    if (!token) return;
    ref.current = io(window.location.origin);
    const s = ref.current;
    s.on('connect', () => s.emit('auth', { userId: user?._id, rol: user?.rol }));
    if (onPosicion) s.on('posicion_update', onPosicion);
    if (onPosicion) s.on('flota_snapshot', d => onPosicion({ snapshot: true, data: d }));
    if (onAlerta) s.on('alerta_nueva', onAlerta);
    if (onPanico) s.on('panico', onPanico);
    if (onMensaje) s.on('mensaje_recibido', onMensaje);
    return () => s.disconnect();
  }, [token]);
  const enviarMensaje = useCallback(d => ref.current?.emit('mensaje', d), []);
  const enviarPanico = useCallback(d => ref.current?.emit('panico', d), []);
  return { enviarMensaje, enviarPanico };
};
