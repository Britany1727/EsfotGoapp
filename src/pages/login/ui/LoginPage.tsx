import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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

            <View style={styles.passwordWrapper}>
              <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Tu contraseña"
              />
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPasswordTouch}
              >
                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonShadowWrapper}>
              <Button
                onPress={handleLogin}
                isLoading={login.isPending}
                label="Iniciar sesión"
              />
            </View>

            {/* Separador Estilizado */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o bien</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botón Google Integrado con Contorno Azul Sutil y Sombras Profundas */}
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
              style={styles.registerLinkContainer}
            >
              <Text style={styles.linkMuted}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.registerHighlight}>
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
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.bg 
  },
  scroll: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 24 
  },
  
  // --- TARJETA PRINCIPAL CON PROFUNDIDAD AZUL ---
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(59, 130, 246, 0.2)", // Haz de contorno azul delgado

    // Sombra de alta dispersión
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  logoImage: { 
    width: 200, 
    height: 200, 
    marginBottom: 5
  },
  title: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "800", 
    marginBottom: 6,
    letterSpacing: 0.5
  },
  subtitle: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 15,
    fontWeight: "500"
  },
  form: { 
    padding: 28, 
    gap: 20 
  },
  passwordWrapper: {
    gap: 8
  },
  forgotPasswordTouch: {
    alignSelf: "flex-end",
    paddingVertical: 2
  },
  link: { 
    color: theme.colors.accent, 
    fontSize: 14,
    fontWeight: "600" 
  },
  linkMuted: { 
    color: theme.colors.textMuted, 
    fontSize: 14 
  },
  
  // Sombra envolvente para el botón principal
  buttonShadowWrapper: {
    marginTop: 4,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  // --- SEPARADOR INTERACTIVO ---
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: "rgba(59, 130, 246, 0.15)" 
  },
  dividerText: { 
    color: theme.colors.textMuted, 
    paddingHorizontal: 12, 
    fontSize: 14,
    fontWeight: "500"
  },

  // --- BOTÓN GOOGLE REDISEÑADO ---
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(59, 130, 246, 0.25)", // Glow sutil azulado en contorno
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    
    // Configuración de profundidad avanzada
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 4,
  },
  googleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  googleIcon: {
    width: 40,
    height: 40,
  },
  googleButtonText: { 
    color: "#111", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  disabledButton: { 
    opacity: 0.6 
  },
  registerLinkContainer: {
    alignItems: "center", 
    marginTop: 10,
    paddingVertical: 4
  },
  registerHighlight: { 
    color: theme.colors.primary, 
    fontWeight: "800" 
  }
});