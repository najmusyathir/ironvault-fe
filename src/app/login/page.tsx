import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Login Page | Iron Vault - Secure File Storage System",
  description: "This is Next.js Login Page for Iron Vault secure file storage system",
};

export default function Login() {
  return <LoginForm />;
}
