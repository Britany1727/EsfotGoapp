import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet
} from "react-native";
 
interface ButtonProps {
  onPress:    () => void;
  label:      string;
  isLoading?: boolean;
  variant?:   "primary" | "ghost" | "danger";
  disabled?:  boolean;
}
 
export const Button = ({
  onPress, label, isLoading, variant = "primary", disabled
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
      activeOpacity={0.8}
    >
      {isLoading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[styles.label, variant === "ghost" && styles.labelGhost]}>{label}</Text>
      }
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  base:        { borderRadius:12, paddingVertical:14, paddingHorizontal:24,
                 alignItems:"center", justifyContent:"center" },
  primary:     { backgroundColor:"#1B3A6B" },
  ghost:       { backgroundColor:"transparent", borderWidth:2, borderColor:"#1B3A6B" },
  danger:      { backgroundColor:"#DC2626" },
  disabled:    { opacity:0.5 },
  label:       { color:"#fff", fontSize:16, fontWeight:"600" },
  labelGhost:  { color:"#1B3A6B" },
});
