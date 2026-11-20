"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  FileText,
  Users,
  ShieldAlert,
  Plus,
  LogOut,
  Sparkles,
  Clock,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface DocItem {
  id: string;
  title: string;
  version: number;
  updatedAt: string;
}

interface MemberItem {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    cursorColor: string;
  };
}

interface AuditItem {
  id: string;
  action: string;
  createdAt: string;
  actor: { name: string };
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  myRole: string;
  documents: DocItem[];
  members: MemberItem[];
  auditLogs: AuditItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const labels = t as unknown as Record<string, string>;

  const [userName, setUserName] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [activeWsId, setActiveWsId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingDoc, setCreatingDoc] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchWorkspaces() {
      try {
        const res = await fetch("/api/workspaces");
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (!isMounted) return;

        setUserName(data.user?.name || "Engineer");
        const list: WorkspaceData[] = data.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0) {
          setActiveWsId((prev) => prev || list[0].id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWorkspaces();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocTitle.trim() || !activeWsId) return;
    setCreatingDoc(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWsId, title: newDocTitle }),
      });

      if (res.ok) {
        const { document } = await res.json();
        setWorkspaces((prev) =>
          prev.map((ws) =>
            ws.id === activeWsId
              ? {
                  ...ws,
                  documents: [document, ...ws.documents],
                  auditLogs: [
                    {
                      id: `local-${Date.now()}`,
                      action: "DOCUMENT_CREATED",
                      createdAt: new Date().toISOString(),
                      actor: { name: userName },
                    },
                    ...ws.auditLogs,
                  ],
                }
              : ws
          )
        );
        setNewDocTitle("");
      }
    } finally {
      setCreatingDoc(false);
    }
  }

  function handleLogout() {
    document.cookie = "vesperasync_token=; Max-Age=0; path=/;";
    localStorage.removeItem("covalent_ws_token");
    router.push("/");
  }

  const currentWs = workspaces.find((w) => w.id === activeWsId) || workspaces[0];
  const filteredDocs =
    currentWs?.documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
          VesperaSync Command Center loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">VesperaSync</span>
              {currentWs && (
                <span className="hidden sm:inline-block ml-3 text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  {currentWs.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-300 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{labels.logoutBtn || "Sign Out"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              {labels.dashboardTitle || "Engineering Command Center"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Role:{" "}
              <span className="text-indigo-400 font-semibold">
                {currentWs?.myRole || "EDITOR"}
              </span>{" "}
              • CRDT Binary Sync Ready
            </p>
          </div>

          {currentWs?.myRole !== "VIEWER" && (
            <form onSubmit={handleCreateDoc} className="flex items-center gap-2">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder={labels.newDocBtn || "New CRDT Document"}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
              />
              <button
                type="submit"
                disabled={creatingDoc}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{labels.newDocBtn || "New CRDT Document"}</span>
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{labels.activeDocs || "Active Documents"}</span>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold">
              {currentWs?.documents.length || 0}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{labels.teamMembers || "Workspace Members"}</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold">
              {currentWs?.members.length || 0}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{labels.auditLogs || "Security Audit Trail"}</span>
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold">
              {currentWs?.auditLogs.length || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                {labels.activeDocs || "Active Documents"}
              </h2>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter documents..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-52"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 flex items-center justify-between transition group"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ID: {doc.id.slice(0, 10)}... • v{doc.version}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      CRDT Ready
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                {labels.teamMembers || "Workspace Members"}
              </h2>
              <div className="space-y-2.5">
                {currentWs?.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: m.user.cursorColor }}
                      />
                      <span className="font-medium text-slate-200">{m.user.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                {labels.auditLogs || "Security Audit Trail"}
              </h2>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {currentWs?.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1"
                  >
                    <div className="font-mono text-[11px] text-cyan-300">{log.action}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{log.actor?.name || "System"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
