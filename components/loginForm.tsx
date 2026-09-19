"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      className="px-3 py-2 border border-border rounded-lg bg-parch text-sm"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="px-3 py-2 border border-border rounded-lg bg-parch text-sm"
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 bg-accent text-white rounded-lg text-sm
               font-medium hover:bg-[#7a5234] disabled:opacity-50"
    >
      {loading ? "Signing in..." : "Sign in"}
    </button>
    <p className="text-xs text-ink-3 text-center">
      Don&apos;t have an account?{" "}
      <a href="/register" className="text-accent hover:underline">
        Create one
      </a>
    </p>
  </form>
);
}