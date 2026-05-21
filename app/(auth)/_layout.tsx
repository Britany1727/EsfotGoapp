import { Stack } from "expo-router";
 
// Layout para las rutas del grupo (auth).
// Todas las pantallas de auth comparten este stack sin header.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
  );
}
