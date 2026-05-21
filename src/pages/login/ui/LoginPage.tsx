import { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Alert, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { supabase } from "@/shared/api/supabase";
import { useLogin } from "@/features/auth/model/useLogin";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { theme } from "@/core/styles/theme";

WebBrowser.maybeCompleteAuthSession();

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGooglePending, setIsGooglePending] = useState(false);
  const login = useLogin();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos requeridos", "Completa email y contraseña.");
      return;
    }
    try {
      await login.mutateAsync({ email, password });
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Credenciales incorrectas.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGooglePending(true);

      // --- WEB (Vercel) ---
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "https://auth-esfot-web-pi.vercel.app/auth/callback",
            skipBrowserRedirect: false,
          },
        });
        if (error) throw error;
        return;
      }

      // --- MÓVIL (Expo Go) ---
      const redirectTo = "exp://192.168.110.25:8081";

      const rawNonce = Math.random().toString(36).substring(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: "openid email profile",
          queryParams: {
            response_type: "token id_token",
            nonce: hashedNonce,
          },
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No se pudo obtener la URL de autenticación.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success") return;

      const hashPart = result.url.split("#")[1];
      const params = new URLSearchParams(hashPart);
      const access_token = params.get("access_token");
      const id_token = params.get("id_token");

      console.log("access_token:", !!access_token);
      console.log("id_token:", !!id_token);

      if (id_token) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: id_token,
          nonce: rawNonce,
        });

        console.log("signInError:", signInError?.message);
        console.log("Sesión activa:", !!signInData.session);
        console.log("Usuario:", signInData.session?.user?.email);

        if (signInError) throw signInError;

        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace("/home");
      } else {
        throw new Error("No se recibió id_token de Google.");
      }

    } catch (error: any) {
      Alert.alert("Error con Google", error.message || "Se canceló el inicio de sesión.");
    } finally {
      setIsGooglePending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={require("../../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>ESFOT — Inicia sesión</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="tu@correo.com"
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Tu contraseña"
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              style={{ alignSelf: "flex-end" }}
            >
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button
              onPress={handleLogin}
              isLoading={login.isPending}
              label="Iniciar sesión"
            />

            {/* Separador */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o bien</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botón Google Integrado con Imagen */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                (isGooglePending || login.isPending) && styles.disabledButton,
              ]}
              onPress={handleGoogleLogin}
              disabled={isGooglePending || login.isPending}
            >
              {isGooglePending ? (
                <ActivityIndicator size="small" color="#111" />
              ) : (
                <View style={styles.googleContent}>
                  <Image 
                    source={require("../../../assets/google.png")}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>Continuar con Google</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              style={{ alignItems: "center", marginTop: 8 }}
            >
              <Text style={styles.linkMuted}>
                ¿No tienes cuenta?{" "}
                <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>
                  Regístrate
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 32,
    alignItems: "center",
  },
  logoImage: { 
    width: 200, 
    height: 200, 
    marginBottom: 12 
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  form: { padding: 28, gap: 16 },
  link: { color: theme.colors.accent, fontSize: 14 },
  linkMuted: { color: theme.colors.textMuted, fontSize: 14 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.1)" },
  dividerText: { color: theme.colors.textMuted, paddingHorizontal: 10, fontSize: 14 },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  googleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: {
    width: 40,
    height: 40,
  },
  googleButtonText: { color: "#111", fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.6 },
});