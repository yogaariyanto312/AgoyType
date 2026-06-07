import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <RegisterForm googleEnabled={isGoogleEnabled} />
    </div>
  );
}
