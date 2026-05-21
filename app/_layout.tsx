import { Stack } from "expo-router";
import { QueryProvider } from "@/core/providers/QueryProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="home" />
        <Stack.Screen name="agregar" />
        <Stack.Screen name="index" />
      </Stack>
    </QueryProvider>
  );
}
