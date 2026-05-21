import { supabase } from "@/shared/api/supabase";
import { useEffect, useState } from "react";

type Status = "loading" | "ready" | "updating" | "success" | "error";

const hasRecoveryTokenInUrl = () => {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  const type = hashParams.get("type") ?? queryParams.get("type");
  const accessToken =
    hashParams.get("access_token") ?? queryParams.get("access_token");
  const tokenHash =
    hashParams.get("token_hash") ?? queryParams.get("token_hash");

  return type === "recovery" && Boolean(accessToken || tokenHash);
};

export const useResetPassword = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const markReady = () => {
      if (!isActive) return;
      setError(null);
      setStatus("ready");
    };

    const checkRecoveryState = async () => {
      if (hasRecoveryTokenInUrl()) {
        markReady();
        return;
      }

      await supabase.auth.getSession();
      markReady();
    };

    void checkRecoveryState();

    // Supabase emite PASSWORD_RECOVERY cuando detecta el token en la URL
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        // El token puede haberse consumido antes de leer el hash.
        // Si hay sesión válida de recuperación, habilitamos el formulario.
        markReady();
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const updatePassword = async (newPassword: string) => {
    setStatus("updating");
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const isExpiredOrInvalid = /expired|invalid|session|token|jwt/i.test(
        error.message,
      );

      setError(
        isExpiredOrInvalid
          ? "El link ha expirado o es inválido. Solicita uno nuevo."
          : error.message,
      );
      setStatus("ready");
      return;
    }

    // Cerrar sesión web después de actualizar (el usuario debe entrar en la app)
    await supabase.auth.signOut();
    setStatus("success");
  };

  return { status, error, updatePassword };
};
