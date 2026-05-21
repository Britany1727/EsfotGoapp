import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/shared/api/supabase";
 
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // URL de la página de reset en Vercel.
          // Supabase construye el email con este redirectTo + el token.
          redirectTo:
            `${process.env.EXPO_PUBLIC_WEB_URL}/reset-password`,
        }
      );
      if (error) throw error;
    },
  });
};
