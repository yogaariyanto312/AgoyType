import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <Suspense>
        <LoginForm googleEnabled={isGoogleEnabled} />
      </Suspense>
    </div>
  );
}
