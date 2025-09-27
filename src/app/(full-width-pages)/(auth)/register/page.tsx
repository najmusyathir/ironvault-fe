import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Register Page | Iron Vault - Secure File Storage System",
  description: "This is Next.js Register Page for Iron Vault secure file storage system",
  // other metadata
};

export default function Register() {
  return <RegisterForm />;
}
