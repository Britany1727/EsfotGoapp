import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api/supabase";
import { SESSION_QUERY_KEY } from "@/features/session/model/useSession";
 
interface LoginCredentials {
  email:    string;
  password: string;
}
 
export const useLogin = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Actualización optimista: ponemos la sesión en caché inmediatamente.
      // El listener de onAuthStateChange también la actualizará,
      // pero esta línea garantiza que sea instantáneo.
      queryClient.setQueryData(SESSION_QUERY_KEY, data.session);
    },
  });
};
