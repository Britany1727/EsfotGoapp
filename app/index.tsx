import { View, ActivityIndicator, StyleSheet } from "react-native";
 
// Esta pantalla se muestra brevemente mientras AuthGuard
// en _layout.tsx determina si el usuario tiene sesión.
export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B3A6B" />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center",
               alignItems:"center", backgroundColor:"#F0F4FF" },
});
