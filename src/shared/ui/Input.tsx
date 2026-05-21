import { View, Text, TextInput, StyleSheet } from "react-native";
 
interface InputProps {
  label:           string;
  value:           string;
  onChangeText:    (t: string) => void;
  placeholder?:    string;
  secureTextEntry?: boolean;
  keyboardType?:   "default" | "email-address" | "numeric";
  error?:          string;
  autoCapitalize?: "none" | "sentences" | "words";
}
 
export const Input = ({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType = "default", error,
  autoCapitalize = "none",
}: InputProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      style={[styles.input, error ? styles.inputError : null]}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
 
const styles = StyleSheet.create({
  wrapper:    { gap:6 },
  label:      { fontSize:14, fontWeight:"500", color:"#334155" },
  input:      { borderWidth:1.5, borderColor:"#CBD5E1", borderRadius:10,
                paddingHorizontal:16, paddingVertical:13, fontSize:15,
                color:"#0F172A", backgroundColor:"#F8FAFC" },
  inputError: { borderColor:"#DC2626" },
  error:      { fontSize:12, color:"#DC2626" },
});
