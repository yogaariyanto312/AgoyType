import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/login?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: { bio: true, keyboard: true },
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </div>
      <SettingsForm
        initialBio={user?.bio ?? ""}
        initialKeyboard={user?.keyboard ?? ""}
      />
    </div>
  );
}
