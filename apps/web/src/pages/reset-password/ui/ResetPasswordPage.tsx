import { ResetPasswordForm } from "@/features/reset-password/ui/ResetPasswordForm";
import type { CSSProperties } from "react";
 
export const ResetPasswordPage = () => (
  <main style={layout}>
    <div style={card}>
      <div style={header}>
        <span style={{ fontSize:"42px" }}>🔑</span>
        <h1 style={{ color:"#fff", margin:"8px 0 4px", fontSize:"22px" }}>
          Nueva contraseña
        </h1>
        <p style={{ color:"rgba(255,255,255,0.7)", margin:0, fontSize:"14px" }}>
          ESFOT Auth — Recuperación de acceso
        </p>
      </div>
      <div style={{ padding:"36px 32px" }}>
        <ResetPasswordForm />
      </div>
    </div>
  </main>
);
 
const layout: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #F0F4FF 0%, #E0EAFF 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "24px",
};
const card: CSSProperties = {
  background: "#fff", borderRadius: "20px",
  boxShadow: "0 20px 60px rgba(27,58,107,0.15)",
  width: "100%", maxWidth: "420px", overflow: "hidden",
};
const header: CSSProperties = {
  background: "linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%)",
  padding: "28px 32px", textAlign: "center",
};
