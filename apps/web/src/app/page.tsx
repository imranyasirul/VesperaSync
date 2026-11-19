"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister ? { name, email, password } : { email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Authentication failed");
      return;
    }

    localStorage.setItem("covalent_ws_token", data.token);
    router.push("/dashboard");
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/demo", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to start demo");
      return;
    }

    localStorage.setItem("covalent_ws_token", data.token);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col lg:flex-row">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute top-6 right-6 z-40">
        <LanguageSelector />
      </div>

      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900/90 to-indigo-950/30 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {t.brand}
          </span>
        </div>

        <div className="my-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            {t.badge}
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>

          <p className="text-slate-400 text-base lg:text-lg max-w-xl leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 transition">
              <Zap className="h-5 w-5 text-amber-400 mb-2.5" />
              <div className="font-bold text-sm text-slate-100">{t.feat1Title}</div>
              <div className="text-xs text-slate-400 mt-1">{t.feat1Desc}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition">
              <Users className="h-5 w-5 text-emerald-400 mb-2.5" />
              <div className="font-bold text-sm text-slate-100">{t.feat2Title}</div>
              <div className="text-xs text-slate-400 mt-1">{t.feat2Desc}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-sky-500/40 transition">
              <ShieldCheck className="h-5 w-5 text-sky-400 mb-2.5" />
              <div className="font-bold text-sm text-slate-100">{t.feat3Title}</div>
              <div className="text-xs text-slate-400 mt-1">{t.feat3Desc}</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Next.js 16 • Yjs CRDT • Binary WebSockets • Redis Pub/Sub • PostgreSQL
        </div>
      </div>

      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md space-y-6 p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-2xl shadow-2xl">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 space-y-3">
            <div className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {t.recruiterTitle}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.recruiterDesc}
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {t.demoBtn}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-500">{t.orDivider}</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.emailLabel}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@covalent.dev"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.passLabel}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "..." : isRegister ? t.registerBtn : t.loginBtn}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            >
              {isRegister ? t.switchToLogin : t.switchToRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}