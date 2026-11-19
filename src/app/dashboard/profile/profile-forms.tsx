"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { changePassword, updateProfile } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForms({ user }: { user: { name: string; email: string; phone: string | null } }) {
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    startProfileTransition(async () => {
      const result = await updateProfile({ name, phone });
      setProfileMessage(result.message ?? "");
    });
  };
  const savePassword = (event: React.FormEvent) => {
    event.preventDefault();
    startPasswordTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword });
      setPasswordMessage(result.message ?? "");
      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
      }
    });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Profile settings</h1>
      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={user.email} disabled /></div>
              <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} /></div>
              <Button disabled={profilePending}>{profilePending ? "Saving..." : "Save profile"}</Button>
              {profileMessage && <p role="status" className="text-sm text-muted-foreground">{profileMessage}</p>}
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={savePassword} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></div>
              <Button disabled={passwordPending}>{passwordPending ? "Changing..." : "Change password"}</Button>
              {passwordMessage && <p role="status" className="text-sm text-muted-foreground">{passwordMessage}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
