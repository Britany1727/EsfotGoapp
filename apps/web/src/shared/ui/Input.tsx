interface InputProps {
  label:       string;
  type?:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  error?:      string;
}
 
export const Input = ({
  label, type = "text", value, onChange, placeholder, error
}: InputProps) => (
  <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
    <label style={{ fontSize:"14px", fontWeight:"500", color:"#334155" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "12px 16px",
        border: `1.5px solid ${error ? "#DC2626" : "#CBD5E1"}`,
        borderRadius: "10px",
        fontSize: "15px",
        color: "#0F172A",
        background: "#F8FAFC",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
    {error && (
      <span style={{ fontSize:"12px", color:"#DC2626" }}>{error}</span>
    )}
  </div>
);
