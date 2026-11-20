"use client";

import { useLanguage } from "./LanguageContext";

export type SupportedLang = "en" | "bn" | "hi" | "es" | "ar" | "fr" | "de" | "ja";

export interface WorkspaceDictionary {
  loadingDashboard: string;
  logoutBtn: string;
  dashboardTitle: string;
  roleLabel: string;
  crdtSyncReady: string;
  newDocBtn: string;
  activeDocs: string;
  teamMembers: string;
  auditLogs: string;
  filterDocsPlaceholder: string;
  crdtReadyBadge: string;
  noDocsFound: string;
  invitePlaceholder: string;
  memberJoined: string;
  memberInviteFailed: string;
  systemActor: string;
  loadingEditor: string;
  backToDashboard: string;
  savingTitle: string;
  shareBtn: string;
  copiedBtn: string;
  exportMdBtn: string;
  offlineReady: string;
  indexing: string;
  binarySyncLive: string;
  connecting: string;
  offlineMode: string;
  liveCollaborators: string;
  youTag: string;
  undoTooltip: string;
  redoTooltip: string;
  readOnlyViewer: string;
  vectorStateActive: string;
  binaryLabel: string;
  savedVsJson: string;
  wordsLabel: string;
  charsLabel: string;
  editorPlaceholder: string;
}

const WORKSPACE_TRANSLATIONS: Record<SupportedLang, WorkspaceDictionary> = {
  en: {
    loadingDashboard: "VesperaSync Command Center loading...",
    logoutBtn: "Sign Out",
    dashboardTitle: "Engineering Command Center",
    roleLabel: "Role",
    crdtSyncReady: "CRDT Binary Sync Ready",
    newDocBtn: "New CRDT Document",
    activeDocs: "Active Documents",
    teamMembers: "Workspace Members",
    auditLogs: "Security Audit Trail",
    filterDocsPlaceholder: "Filter documents...",
    crdtReadyBadge: "CRDT Ready",
    noDocsFound: "No matching documents found",
    invitePlaceholder: "colleague@company.com",
    memberJoined: "added to workspace",
    memberInviteFailed: "Could not add member",
    systemActor: "System",
    loadingEditor: "Initializing VesperaSync CRDT Engine...",
    backToDashboard: "Back to Dashboard",
    savingTitle: "Saving title...",
    shareBtn: "Share",
    copiedBtn: "Copied",
    exportMdBtn: "Export .md",
    offlineReady: "Offline Ready",
    indexing: "Indexing...",
    binarySyncLive: "Binary Sync Live",
    connecting: "Connecting...",
    offlineMode: "Offline Mode",
    liveCollaborators: "Live Collaborators",
    youTag: "(You)",
    undoTooltip: "CRDT Local Undo",
    redoTooltip: "CRDT Local Redo",
    readOnlyViewer: "Read-Only Viewer",
    vectorStateActive: "Yjs CRDT Vector State Active • Zero-Conflict Merge",
    binaryLabel: "binary",
    savedVsJson: "saved vs JSON",
    wordsLabel: "words",
    charsLabel: "chars",
    editorPlaceholder:
      "Start typing here... Open this same document in another browser tab to see live floating multiplayer cursors, binary telemetry, and CRDT undo/redo in action.",
  },
  bn: {
    loadingDashboard: "ভেসপেরাসিঙ্ক কমান্ড সেন্টার লোড হচ্ছে...",
    logoutBtn: "সাইন আউট",
    dashboardTitle: "ইঞ্জিনিয়ারিং কমান্ড সেন্টার",
    roleLabel: "ভূমিকা",
    crdtSyncReady: "সিআরডিটি বাইনারি সিঙ্ক প্রস্তুত",
    newDocBtn: "নতুন সিআরডিটি ডকুমেন্ট",
    activeDocs: "সক্রিয় ডকুমেন্টসমূহ",
    teamMembers: "ওয়ার্কস্পেস সদস্যবৃন্দ",
    auditLogs: "নিরাপত্তা অডিট লগ",
    filterDocsPlaceholder: "ডকুমেন্ট খুঁজুন...",
    crdtReadyBadge: "সিআরডিটি প্রস্তুত",
    noDocsFound: "কোনো ডকুমেন্ট পাওয়া যায়নি",
    invitePlaceholder: "সহকর্মীর ইমেইল লিখুন...",
    memberJoined: "ওয়ার্কস্পেসে যুক্ত হয়েছেন",
    memberInviteFailed: "সদস্য যুক্ত করা যায়নি",
    systemActor: "সিস্টেম",
    loadingEditor: "ভেসপেরাসিঙ্ক সিআরডিটি ইঞ্জিন চালু হচ্ছে...",
    backToDashboard: "ড্যাশবোর্ডে ফিরে যান",
    savingTitle: "শিরোনাম সংরক্ষণ হচ্ছে...",
    shareBtn: "শেয়ার",
    copiedBtn: "কপি হয়েছে",
    exportMdBtn: "ডাউনলোড .md",
    offlineReady: "অফলাইন প্রস্তুত",
    indexing: "ইন্ডেক্সিং হচ্ছে...",
    binarySyncLive: "বাইনারি সিঙ্ক লাইভ",
    connecting: "যুক্ত হচ্ছে...",
    offlineMode: "অফলাইন মোড",
    liveCollaborators: "সরাসরি যুক্ত সহকর্মী",
    youTag: "(আপনি)",
    undoTooltip: "পূর্বাবস্থায় ফিরুন (Undo)",
    redoTooltip: "পুনরায় করুন (Redo)",
    readOnlyViewer: "শুধুমাত্র পাঠযোগ্য (Viewer)",
    vectorStateActive: "সিআরডিটি ভেক্টর স্টেট সক্রিয় • সংঘাতমুক্ত মার্জ",
    binaryLabel: "বাইনারি",
    savedVsJson: "ডেটা সাশ্রয় (JSON-এর তুলনায়)",
    wordsLabel: "শব্দ",
    charsLabel: "অক্ষর",
    editorPlaceholder:
      "এখানে টাইপ করা শুরু করুন... অন্য একটি ব্রাউজার ট্যাবে একই ডকুমেন্ট খুলে লাইভ মাল্টিপ্লেয়ার কার্সার, বাইনারি টেলিমেট্রি এবং সিআরডিটি আনডু/রিডু সরাসরি দেখুন।",
  },
  hi: {
    loadingDashboard: "VesperaSync कमांड सेंटर लोड हो रहा है...",
    logoutBtn: "साइन आउट",
    dashboardTitle: "इंजीनियरिंग कमांड सेंटर",
    roleLabel: "भूमिका",
    crdtSyncReady: "CRDT बाइनरी सिंक तैयार",
    newDocBtn: "नया CRDT दस्तावेज़",
    activeDocs: "सक्रिय दस्तावेज़",
    teamMembers: "कार्यक्षेत्र सदस्य",
    auditLogs: "सुरक्षा ऑडिट लॉग",
    filterDocsPlaceholder: "दस्तावेज़ खोजें...",
    crdtReadyBadge: "CRDT तैयार",
    noDocsFound: "कोई दस्तावेज़ नहीं मिला",
    invitePlaceholder: "सहकर्मी का ईमेल...",
    memberJoined: "कार्यक्षेत्र में जोड़ा गया",
    memberInviteFailed: "सदस्य जोड़ा नहीं जा सका",
    systemActor: "सिस्टम",
    loadingEditor: "VesperaSync CRDT इंजन प्रारंभ हो रहा है...",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    savingTitle: "शीर्षक सहेजा जा रहा है...",
    shareBtn: "शेयर करें",
    copiedBtn: "कॉपी हो गया",
    exportMdBtn: "एक्सपोर्ट .md",
    offlineReady: "ऑफ़लाइन तैयार",
    indexing: "इंडेक्सिंग...",
    binarySyncLive: "बाइनरी सिंक लाइव",
    connecting: "कनेक्ट हो रहा है...",
    offlineMode: "ऑफ़लाइन मोड",
    liveCollaborators: "लाइव सहयोगी",
    youTag: "(आप)",
    undoTooltip: "CRDT लोकल पूर्ववत करें",
    redoTooltip: "CRDT लोकल फिर से करें",
    readOnlyViewer: "केवल पढ़ने योग्य",
    vectorStateActive: "Yjs CRDT वेक्टर स्टेट सक्रिय • शून्य-संघर्ष मर्ज",
    binaryLabel: "बाइनरी",
    savedVsJson: "बचत (JSON की तुलना में)",
    wordsLabel: "शब्द",
    charsLabel: "अक्षर",
    editorPlaceholder:
      "यहाँ टाइप करना शुरू करें... लाइव मल्टीप्लेयर कर्सर और बाइनरी सिंक देखने के लिए इस दस्तावेज़ को दूसरे टैब में खोलें।",
  },
  es: {
    loadingDashboard: "Cargando Centro de Comando VesperaSync...",
    logoutBtn: "Cerrar sesión",
    dashboardTitle: "Centro de Comando de Ingeniería",
    roleLabel: "Rol",
    crdtSyncReady: "Sincronización Binaria CRDT Lista",
    newDocBtn: "Nuevo Documento CRDT",
    activeDocs: "Documentos Activos",
    teamMembers: "Miembros del Espacio",
    auditLogs: "Registro de Auditoría",
    filterDocsPlaceholder: "Filtrar documentos...",
    crdtReadyBadge: "CRDT Listo",
    noDocsFound: "No se encontraron documentos",
    invitePlaceholder: "colega@empresa.com",
    memberJoined: "añadido al espacio",
    memberInviteFailed: "No se pudo añadir al miembro",
    systemActor: "Sistema",
    loadingEditor: "Iniciando Motor CRDT VesperaSync...",
    backToDashboard: "Volver al Panel",
    savingTitle: "Guardando título...",
    shareBtn: "Compartir",
    copiedBtn: "Copiado",
    exportMdBtn: "Exportar .md",
    offlineReady: "Listo Sin Conexión",
    indexing: "Indexando...",
    binarySyncLive: "Sincronización Binaria Activa",
    connecting: "Conectando...",
    offlineMode: "Modo Sin Conexión",
    liveCollaborators: "Colaboradores en Vivo",
    youTag: "(Tú)",
    undoTooltip: "Deshacer Local CRDT",
    redoTooltip: "Rehacer Local CRDT",
    readOnlyViewer: "Solo Lectura",
    vectorStateActive: "Estado Vectorial Yjs CRDT Activo • Fusión Sin Conflictos",
    binaryLabel: "binario",
    savedVsJson: "ahorrado frente a JSON",
    wordsLabel: "palabras",
    charsLabel: "caracteres",
    editorPlaceholder:
      "Empieza a escribir aquí... Abre este mismo documento en otra pestaña para ver cursores multijugador en vivo.",
  },
  ar: {
    loadingDashboard: "جاري تحميل مركز قيادة VesperaSync...",
    logoutBtn: "تسجيل الخروج",
    dashboardTitle: "مركز القيادة الهندسية",
    roleLabel: "الدور",
    crdtSyncReady: "مزامنة CRDT الثنائية جاهزة",
    newDocBtn: "مستند CRDT جديد",
    activeDocs: "المستندات النشطة",
    teamMembers: "أعضاء مساحة العمل",
    auditLogs: "سجل تدقيق الأمان",
    filterDocsPlaceholder: "تصفية المستندات...",
    crdtReadyBadge: "CRDT جاهز",
    noDocsFound: "لم يتم العثور على مستندات",
    invitePlaceholder: "colleague@company.com",
    memberJoined: "تمت إضافته إلى مساحة العمل",
    memberInviteFailed: "تعذرت إضافة العضو",
    systemActor: "النظام",
    loadingEditor: "جاري تشغيل محرك VesperaSync CRDT...",
    backToDashboard: "العودة إلى لوحة القيادة",
    savingTitle: "جاري حفظ العنوان...",
    shareBtn: "مشاركة",
    copiedBtn: "تم النسخ",
    exportMdBtn: "تصدير .md",
    offlineReady: "جاهز دون اتصال",
    indexing: "جاري الفهرسة...",
    binarySyncLive: "المزامنة الثنائية مباشرة",
    connecting: "جاري الاتصال...",
    offlineMode: "وضع عدم الاتصال",
    liveCollaborators: "المتعاونون المباشرون",
    youTag: "(أنت)",
    undoTooltip: "تراجع محلي CRDT",
    redoTooltip: "إعادة محلية CRDT",
    readOnlyViewer: "للقراءة فقط",
    vectorStateActive: "حالة متجه Yjs CRDT نشطة • دمج بدون تعارض",
    binaryLabel: "بايت ثنائي",
    savedVsJson: "توفير مقارنة بـ JSON",
    wordsLabel: "كلمات",
    charsLabel: "أحرف",
    editorPlaceholder:
      "ابدأ الكتابة هنا... افتح نفس المستند في علامة تبويب أخرى لمشاهدة المؤشرات الحية.",
  },
  fr: {
    loadingDashboard: "Chargement du centre de commande VesperaSync...",
    logoutBtn: "Déconnexion",
    dashboardTitle: "Centre de Commande d'Ingénierie",
    roleLabel: "Rôle",
    crdtSyncReady: "Synchronisation Binaire CRDT Prête",
    newDocBtn: "Nouveau Document CRDT",
    activeDocs: "Documents Actifs",
    teamMembers: "Membres de l'Espace",
    auditLogs: "Journal d'Audit de Sécurité",
    filterDocsPlaceholder: "Filtrer les documents...",
    crdtReadyBadge: "CRDT Prêt",
    noDocsFound: "Aucun document trouvé",
    invitePlaceholder: "collegue@entreprise.com",
    memberJoined: "ajouté à l'espace",
    memberInviteFailed: "Impossible d'ajouter le membre",
    systemActor: "Système",
    loadingEditor: "Initialisation du moteur CRDT VesperaSync...",
    backToDashboard: "Retour au tableau de bord",
    savingTitle: "Enregistrement du titre...",
    shareBtn: "Partager",
    copiedBtn: "Copié",
    exportMdBtn: "Exporter .md",
    offlineReady: "Prêt Hors Ligne",
    indexing: "Indexation...",
    binarySyncLive: "Sync Binaire en Direct",
    connecting: "Connexion...",
    offlineMode: "Mode Hors Ligne",
    liveCollaborators: "Collaborateurs en Direct",
    youTag: "(Vous)",
    undoTooltip: "Annulation Locale CRDT",
    redoTooltip: "Rétablissement Local CRDT",
    readOnlyViewer: "Lecteur Seul",
    vectorStateActive: "État Vectoriel Yjs CRDT Actif • Fusion Sans Conflit",
    binaryLabel: "binaire",
    savedVsJson: "économisé vs JSON",
    wordsLabel: "mots",
    charsLabel: "caractères",
    editorPlaceholder:
      "Commencez à écrire ici... Ouvrez ce document dans un autre onglet pour voir les curseurs en direct.",
  },
  de: {
    loadingDashboard: "VesperaSync Kommandozentrale wird geladen...",
    logoutBtn: "Abmelden",
    dashboardTitle: "Engineering Kommandozentrale",
    roleLabel: "Rolle",
    crdtSyncReady: "CRDT Binär-Sync Bereit",
    newDocBtn: "Neues CRDT-Dokument",
    activeDocs: "Aktive Dokumente",
    teamMembers: "Workspace-Mitglieder",
    auditLogs: "Sicherheits-Audit-Protokoll",
    filterDocsPlaceholder: "Dokumente filtern...",
    crdtReadyBadge: "CRDT Bereit",
    noDocsFound: "Keine Dokumente gefunden",
    invitePlaceholder: "kollege@firma.de",
    memberJoined: "zum Workspace hinzugefügt",
    memberInviteFailed: "Mitglied konnte nicht hinzugefügt werden",
    systemActor: "System",
    loadingEditor: "VesperaSync CRDT-Engine wird gestartet...",
    backToDashboard: "Zurück zum Dashboard",
    savingTitle: "Titel wird gespeichert...",
    shareBtn: "Teilen",
    copiedBtn: "Kopiert",
    exportMdBtn: "Export .md",
    offlineReady: "Offline Bereit",
    indexing: "Indizierung...",
    binarySyncLive: "Binär-Sync Live",
    connecting: "Verbinden...",
    offlineMode: "Offline-Modus",
    liveCollaborators: "Live-Mitarbeiter",
    youTag: "(Sie)",
    undoTooltip: "CRDT Lokales Rückgängig",
    redoTooltip: "CRDT Lokales Wiederholen",
    readOnlyViewer: "Nur-Lese-Zugriff",
    vectorStateActive: "Yjs CRDT Vektorstatus Aktiv • Konfliktfreier Merge",
    binaryLabel: "Binär",
    savedVsJson: "gespart vs. JSON",
    wordsLabel: "Wörter",
    charsLabel: "Zeichen",
    editorPlaceholder:
      "Beginnen Sie hier zu tippen... Öffnen Sie dieses Dokument in einem weiteren Tab für Live-Cursor.",
  },
  ja: {
    loadingDashboard: "VesperaSync コマンドセンターを読み込み中...",
    logoutBtn: "ログアウト",
    dashboardTitle: "エンジニアリング・コマンドセンター",
    roleLabel: "権限",
    crdtSyncReady: "CRDT バイナリ同期準備完了",
    newDocBtn: "新規 CRDT ドキュメント",
    activeDocs: "アクティブなドキュメント",
    teamMembers: "ワークスペースメンバー",
    auditLogs: "セキュリティ監査ログ",
    filterDocsPlaceholder: "ドキュメントを検索...",
    crdtReadyBadge: "CRDT 準備完了",
    noDocsFound: "一致するドキュメントがありません",
    invitePlaceholder: "colleague@company.com",
    memberJoined: "が追加されました",
    memberInviteFailed: "メンバーを追加できませんでした",
    systemActor: "システム",
    loadingEditor: "VesperaSync CRDT エンジンを初期化中...",
    backToDashboard: "ダッシュボードに戻る",
    savingTitle: "タイトルを保存中...",
    shareBtn: "共有",
    copiedBtn: "コピー完了",
    exportMdBtn: ".md エクスポート",
    offlineReady: "オフライン対応",
    indexing: "インデックス中...",
    binarySyncLive: "バイナリ同期ライブ",
    connecting: "接続中...",
    offlineMode: "オフラインモード",
    liveCollaborators: "ライブ共同編集者",
    youTag: "(あなた)",
    undoTooltip: "CRDT ローカル元に戻す",
    redoTooltip: "CRDT ローカルやり直し",
    readOnlyViewer: "閲覧専用",
    vectorStateActive: "Yjs CRDT ベクトル状態アクティブ • 競合なしマージ",
    binaryLabel: "バイナリ",
    savedVsJson: "JSON比で削減",
    wordsLabel: "単語",
    charsLabel: "文字",
    editorPlaceholder:
      "ここに入力してください... 別のブラウザタブで同じドキュメントを開くとライブカーソルを確認できます。",
  },
};

function detectLanguage(ctx: Record<string, unknown>): SupportedLang {
  const rawCode = String(
    ctx.language || ctx.lang || ctx.locale || ctx.currentLanguage || ""
  ).toLowerCase();

  if (rawCode.startsWith("bn")) return "bn";
  if (rawCode.startsWith("hi")) return "hi";
  if (rawCode.startsWith("es")) return "es";
  if (rawCode.startsWith("ar")) return "ar";
  if (rawCode.startsWith("fr")) return "fr";
  if (rawCode.startsWith("de")) return "de";
  if (rawCode.startsWith("ja")) return "ja";
  if (rawCode.startsWith("en")) return "en";

  const serialized = JSON.stringify(ctx.t || {});
  if (/[\u0980-\u09FF]/.test(serialized)) return "bn";
  if (/[\u0900-\u097F]/.test(serialized)) return "hi";
  if (/[\u0600-\u06FF]/.test(serialized)) return "ar";
  if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(serialized)) return "ja";
  if (/\b(Tiempo real|Espacio|Iniciar|Comenzar|Colaboración)\b/i.test(serialized)) return "es";
  if (/\b(Temps réel|Espace|Connexion|Commencer)\b/i.test(serialized)) return "fr";
  if (/\b(Echtzeit|Arbeitsbereich|Anmelden|Starten)\b/i.test(serialized)) return "de";

  return "en";
}

export function useWorkspaceTranslations(): WorkspaceDictionary {
  const ctx = useLanguage() as unknown as Record<string, unknown>;
  const lang = detectLanguage(ctx);
  return WORKSPACE_TRANSLATIONS[lang] || WORKSPACE_TRANSLATIONS.en;
}