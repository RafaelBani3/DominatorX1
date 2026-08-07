"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login gagal. Periksa kembali kredensial Anda.");
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F6FB] px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#7C5CFC]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-[#FF6B9D]/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(124,92,252,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C5CFC] text-xl font-bold text-white shadow-[0_12px_30px_rgba(124,92,252,0.35)]">
            D
          </div>
          <h1 className="text-2xl font-bold text-[#1F2430]">Admin Panel</h1>
          <p className="mt-1 text-sm text-[#8A93A6]">
            Login untuk mengelola Dominator XI
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-center text-sm text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#6B7285]">
              Email / Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="admin@dominator.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-2xl border-[#E8ECF4] bg-[#F7F8FC] px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#6B7285]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-2xl border-[#E8ECF4] bg-[#F7F8FC] px-4"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl bg-[#7C5CFC] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,92,252,0.35)] hover:bg-[#6B4CEB]"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
