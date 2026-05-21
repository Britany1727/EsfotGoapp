import type { User } from "@supabase/supabase-js";
 
// Re-exportamos el tipo User de Supabase para que el resto de la app
// no dependa directamente de @supabase/supabase-js en todas partes.
// Si algún día cambiamos de proveedor, solo cambiamos este archivo.
export type { User };
 
// Tipo de perfil extendido (cuando tengas tabla profiles en Supabase)
export interface UserProfile {
  id:         string;
  email:      string;
  fullName?:  string;
  avatarUrl?: string;
  createdAt:  string;
}
