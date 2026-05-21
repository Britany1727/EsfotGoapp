import { ReactNode, CSSProperties } from "react";
 
interface ButtonProps {
  children:  ReactNode;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  variant?:  "primary" | "ghost";
  disabled?: boolean;
  isLoading?: boolean;
}
 
export const Button = ({
  children, onClick, type = "button",
  variant = "primary", disabled, isLoading,
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;
 
  const base: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", padding: "13px 24px", borderRadius: "10px",
    fontSize: "15px", fontWeight: "600", cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease", border: "none", width: "100%",
    opacity: isDisabled ? 0.6 : 1,
  };
 
  const styles: Record<string, CSSProperties> = {
    primary: { background: "#1B3A6B", color: "#fff" },
    ghost:   { background: "transparent", color: "#1B3A6B",
               border: "2px solid #1B3A6B" },
  };
 
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{ ...base, ...styles[variant] }}
    >
      {isLoading ? "Cargando..." : children}
    </button>
  );
};
