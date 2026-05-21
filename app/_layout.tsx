    import { useEffect } from "react";
    import { Stack }     from "expo-router";
    import { router }    from "expo-router";
    import { QueryProvider } from "@/core/providers/QueryProvider";
    import { useSession }    from "@/features/session/model/useSession";
    
    // Componente interno que maneja la redirección basada en auth.
    // Está dentro de QueryProvider para poder usar useSession.
    function AuthGuard() {
    const { isAuthenticated, isLoading } = useSession();
    
    useEffect(() => {
        if (isLoading) return; // Esperar a que se cargue la sesión
    
        if (isAuthenticated) {
        // Usuario autenticado → ir a la pantalla principal
        router.replace("/home");
        } else {
        // Sin sesión → ir al login
        router.replace("/login");
        }
    }, [isAuthenticated, isLoading]);
    
    return null; // Este componente no renderiza nada, solo navega
    }
    
    export default function RootLayout() {
    return (
        <QueryProvider>
        <Stack screenOptions={{ headerShown: false }}>
            {/* Grupo de rutas de autenticación */}
            <Stack.Screen name="(auth)" />
            {/* Pantalla principal */}
            <Stack.Screen name="home"  />
            {/* Agregar lugar */}
            <Stack.Screen name="agregar" />
            {/* Ruta índice: solo redirige, no muestra nada */}
            <Stack.Screen name="index" />
        </Stack>
        <AuthGuard />
        </QueryProvider>
    );
    }
