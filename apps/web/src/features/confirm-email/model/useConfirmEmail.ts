import { useState, useEffect } from "react";
import { supabase } from "@/shared/api/supabase";
 
type Status = "loading" | "success" | "error";
 
export const useConfirmEmail = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError]   = useState<string | null>(null);
 
  useEffect(() => {
    // Supabase procesa el token del hash de la URL automáticamente.
    // Escuchamos el evento de cambio de estado para saber si fue exitoso.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          setStatus("success");
          // Cerrar la sesión para que el usuario no quede logueado en el web
          await supabase.auth.signOut();
        }
      }
    );
 
    // Timeout: si en 8 segundos no llegó el evento, algo salió mal
    const timeout = setTimeout(() => {
      setStatus(prev => prev === "loading" ? "error" : prev);
      setError("El link de confirmación es inválido o ha expirado.");
    }, 8000);
 
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);
 
  return { status, error };
};
