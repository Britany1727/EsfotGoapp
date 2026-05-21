import { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity, ScrollView, Image // <-- Importación añadida
} from "react-native";
import { router }       from "expo-router";
import { useRegister }  from "@/features/auth/model/useRegister";
import { Input }        from "@/shared/ui/Input";
import { Button }       from "@/shared/ui/Button";
import { theme }        from "@/core/styles/theme";
 
export const RegisterPage = () => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [success,  setSuccess]  = useState(false);
  const register = useRegister();
 
  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Campos requeridos", "Completa todos los campos.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Contraseña débil", "Mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    try {
      await register.mutateAsync({ email, password });
      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Error al registrarse", err.message);
    }
  };
 
  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>📬</Text>
        <Text style={styles.successTitle}>¡Revisa tu email!</Text>
        <Text style={styles.successText}>
          Te enviamos un link de confirmación a{" "}
          <Text style={{ fontWeight:"700" }}>{email}</Text>.
          {"  "}Confirma tu cuenta para poder iniciar sesión.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>← Volver al login</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="height"
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            {/* Reemplazamos las estrellas por la imagen del logo */}
            <Image 
              source={require("../../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>ESFOT — Únete ahora</Text>
          </View>
          <View style={styles.form}>
            <Input label="Correo electrónico" value={email}
              onChangeText={setEmail} keyboardType="email-address"
              placeholder="tu@correo.com" />
            <Input label="Contraseña" value={password}
              onChangeText={setPassword} secureTextEntry
              placeholder="Mínimo 8 caracteres" />
            <Input label="Confirmar contraseña" value={confirm}
              onChangeText={setConfirm} secureTextEntry
              placeholder="Repite tu contraseña" />
            <Button onPress={handleRegister}
              isLoading={register.isPending}
              label="Crear cuenta" />
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ alignItems:"center" }}
            >
              <Text style={styles.linkMuted}>
                ¿Ya tienes cuenta?{" "}
                <Text style={{ color: theme.colors.primary, fontWeight:"700" }}>
                  Inicia sesión
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
  container:        { flex:1, backgroundColor: theme.colors.bg },
  scroll:           { flexGrow:1, justifyContent:"center", padding:24 },
  card:             { backgroundColor: theme.colors.card, borderRadius:20,
                      overflow:"hidden", ...theme.shadow.card },
  header:           { backgroundColor: theme.colors.primary, padding:32,
                      alignItems:"center" },
  // Nueva clase de estilo asignada a 200x200 px
  logoImage:        { width: 200, height: 200, marginBottom: 12 },
  title:            { color:"#fff", fontSize:26, fontWeight:"700", marginBottom:4 },
  subtitle:         { color:"rgba(255,255,255,0.75)", fontSize:14 },
  form:             { padding:28, gap:16 },
  link:             { color: theme.colors.accent, fontSize:15,
                      fontWeight:"600", marginTop:8 },
  linkMuted:        { color: theme.colors.textMuted, fontSize:14 },
  successContainer: { flex:1, backgroundColor: theme.colors.bg,
                      justifyContent:"center", alignItems:"center", padding:32 },
  successIcon:      { fontSize:72, marginBottom:24 },
  successTitle:     { fontSize:26, fontWeight:"700",
                      color: theme.colors.primary, marginBottom:16 },
  successText:      { fontSize:16, color: theme.colors.textMid,
                      textAlign:"center", lineHeight:24, marginBottom:32 },
});