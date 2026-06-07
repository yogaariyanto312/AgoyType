"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useConfigStore } from "@/store/config-store";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface Props {
  initialBio: string;
  initialKeyboard: string;
}

export function SettingsForm({ initialBio, initialKeyboard }: Props) {
  const [bio, setBio] = useState(initialBio);
  const [keyboard, setKeyboard] = useState(initialKeyboard);
  const [saving, setSaving] = useState(false);

  const themeId = useConfigStore((s) => s.themeId);
  const setTheme = useConfigStore((s) => s.setTheme);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);
  const setSmoothCaret = useConfigStore((s) => s.setSmoothCaret);
  const hideLiveWpm = useConfigStore((s) => s.hideLiveWpm);
  const setHideLiveWpm = useConfigStore((s) => s.setHideLiveWpm);
  const soundOnClick = useConfigStore((s) => s.soundOnClick);
  const setSoundOnClick = useConfigStore((s) => s.setSoundOnClick);
  const particlesBg = useConfigStore((s) => s.particlesBg);
  const setParticlesBg = useConfigStore((s) => s.setParticlesBg);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, keyboard }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to others on TypeFlow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              maxLength={280}
              value={bio}
              placeholder="Tell the world about your typing journey…"
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">{bio.length}/280</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyboard">Keyboard</Label>
            <Input
              id="keyboard"
              maxLength={60}
              value={keyboard}
              placeholder="e.g. Keychron K2, Gateron Browns"
              onChange={(e) => setKeyboard(e.target.value)}
            />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme and typing preferences (saved on this device).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors",
                    themeId === theme.id ? "border-tt-main" : "hover:bg-accent",
                  )}
                  style={{ background: `hsl(${theme.colors.background})`, color: `hsl(${theme.colors.foreground})` }}
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: `hsl(${theme.colors.ttMain})` }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Smooth caret</Label>
              <p className="text-sm text-muted-foreground">Animate the caret between letters.</p>
            </div>
            <Switch checked={smoothCaret} onCheckedChange={setSmoothCaret} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Hide live WPM</Label>
              <p className="text-sm text-muted-foreground">Hide the running speed while typing.</p>
            </div>
            <Switch checked={hideLiveWpm} onCheckedChange={setHideLiveWpm} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Click sounds</Label>
              <p className="text-sm text-muted-foreground">Play a sound on each keystroke.</p>
            </div>
            <Switch checked={soundOnClick} onCheckedChange={setSoundOnClick} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Particle background</Label>
              <p className="text-sm text-muted-foreground">
                Animated constellation behind the page.
              </p>
            </div>
            <Switch checked={particlesBg} onCheckedChange={setParticlesBg} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
