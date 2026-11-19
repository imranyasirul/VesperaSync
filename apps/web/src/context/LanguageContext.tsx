"use client";

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from "react";

export interface LanguageItem {
  code: string;
  country: string;
  name: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export const TOP_20_LANGUAGES: LanguageItem[] = [
  { code: "en", country: "United States", name: "English", flag: "🇺🇸" },
  { code: "bn", country: "Bangladesh", name: "বাংলা", flag: "🇧🇩" },
  { code: "hi", country: "India", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", country: "Spain", name: "Español", flag: "🇪🇸" },
  { code: "fr", country: "France", name: "Français", flag: "🇫🇷" },
  { code: "de", country: "Germany", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", country: "Japan", name: "日本語", flag: "🇯🇵" },
  { code: "ko", country: "South Korea", name: "한국어", flag: "🇰🇷" },
  { code: "zh", country: "China", name: "中文", flag: "🇨🇳" },
  { code: "ar", country: "Saudi Arabia", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "pt", country: "Brazil", name: "Português", flag: "🇧🇷" },
  { code: "ru", country: "Russia", name: "Русский", flag: "🇷🇺" },
  { code: "it", country: "Italy", name: "Italiano", flag: "🇮🇹" },
  { code: "tr", country: "Turkey", name: "Türkçe", flag: "🇹🇷" },
  { code: "nl", country: "Netherlands", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", country: "Poland", name: "Polski", flag: "🇵🇱" },
  { code: "id", country: "Indonesia", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "vi", country: "Vietnam", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", country: "Thailand", name: "ไทย", flag: "🇹🇭" },
  { code: "ur", country: "Pakistan", name: "اردو", flag: "🇵🇰", dir: "rtl" },
];

type TranslationKeys = {
  brand: string;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  recruiterTitle: string;
  recruiterDesc: string;
  demoBtn: string;
  orDivider: string;
  nameLabel: string;
  emailLabel: string;
  passLabel: string;
  loginBtn: string;
  registerBtn: string;
  switchToRegister: string;
  switchToLogin: string;
};

const DICTIONARY: Record<string, TranslationKeys> = {
  en: {
    brand: "Covalent",
    badge: "CRDT & Binary WebSocket Engine",
    heroTitle: "Conflict-Free Real-Time Collaboration Workspace",
    heroSubtitle: "Co-edit documents simultaneously, track live multiplayer cursors in milliseconds, and work seamlessly offline.",
    feat1Title: "Binary Sync",
    feat1Desc: "90% lower bandwidth",
    feat2Title: "Live Cursors",
    feat2Desc: "Redis Pub/Sub presence",
    feat3Title: "Offline-First",
    feat3Desc: "Auto delta state merge",
    recruiterTitle: "Hiring Manager or Tech Lead?",
    recruiterDesc: "Skip registration and jump straight into a shared engineering workspace with live sync.",
    demoBtn: "Launch Instant Live Demo",
    orDivider: "Or continue with credentials",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    passLabel: "Password",
    loginBtn: "Sign In to Workspace",
    registerBtn: "Create Engineering Account",
    switchToRegister: "New to Covalent? Create an account",
    switchToLogin: "Already have an account? Sign in",
  },
  bn: {
    brand: "কভ্যালেন্ট",
    badge: "সিআরডিটি ও বাইনারি ওয়েবসকেট ইঞ্জিন",
    heroTitle: "কনফ্লিক্ট-ফ্রি রিয়েল-টাইম কোলাবরেশন ওয়ার্কস্পেস",
    heroSubtitle: "একাধিক ব্যবহারকারী একসাথে ডকুমেন্ট এডিট করুন, মিলিসেকেন্ডে লাইভ কার্সার দেখুন এবং ইন্টারনেট ছাড়াই নির্বিঘ্নে কাজ চালিয়ে যান।",
    feat1Title: "বাইনারি সিঙ্ক",
    feat1Desc: "৯০% কম ব্যান্ডউইথ খরচ",
    feat2Title: "লাইভ কার্সার",
    feat2Desc: "রেডিস পাব/সাব প্রেজেন্স",
    feat3Title: "অফলাইন-ফার্স্ট",
    feat3Desc: "স্বয়ংক্রিয় ডেল্টা মার্জ",
    recruiterTitle: "ইন্টারভিউয়ার বা রিক্রুটার?",
    recruiterDesc: "অ্যাকাউন্ট খোলার ঝামেলা ছাড়াই সরাসরি শেয়ার্ড ইঞ্জিনিয়ারিং ওয়ার্কস্পেসে প্রবেশ করে লাইভ কোলাবরেশন দেখুন।",
    demoBtn: "এক ক্লিকে লাইভ ডেমো দেখুন",
    orDivider: "অথবা নিজস্ব অ্যাকাউন্ট",
    nameLabel: "পূর্ণ নাম",
    emailLabel: "ইমেইল ঠিকানা",
    passLabel: "পাসওয়ার্ড",
    loginBtn: "ওয়ার্কস্পেসে প্রবেশ করুন",
    registerBtn: "নতুন অ্যাকাউন্ট তৈরি করুন",
    switchToRegister: "নতুন ব্যবহারকারী? অ্যাকাউন্ট খুলুন",
    switchToLogin: "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন",
  },
  hi: {
    brand: "कोवैलेंट",
    badge: "CRDT और बाइनरी वेबसॉकेट इंजन",
    heroTitle: "रियल-टाइम कोलैबोरेशन वर्कस्पेस",
    heroSubtitle: "एक साथ दस्तावेज़ संपादित करें, लाइव कर्सर ट्रैक करें और ऑफ़लाइन भी निर्बाध रूप से काम करें।",
    feat1Title: "बाइनरी सिंक",
    feat1Desc: "90% कम बैंडविड्थ",
    feat2Title: "लाइव कर्सर",
    feat2Desc: "रेडिस पब/सब उपस्थिति",
    feat3Title: "ऑफ़लाइन-फर्स्ट",
    feat3Desc: "ऑटो डेल्टा मर्ज",
    recruiterTitle: "रिक्रूटर या टेक लीड?",
    recruiterDesc: "बिना रजिस्ट्रेशन के सीधे लाइव इंजीनियरिंग वर्कस्पेस में प्रवेश करें।",
    demoBtn: "एक क्लिक में लाइव डेमो देखें",
    orDivider: "या अपने खाते से जारी रखें",
    nameLabel: "पूरा नाम",
    emailLabel: "ईमेल पता",
    passLabel: "पासवर्ड",
    loginBtn: "साइन इन करें",
    registerBtn: "नया खाता बनाएं",
    switchToRegister: "नया खाता बनाना चाहते हैं? रजिस्टर करें",
    switchToLogin: "पहले से खाता है? साइन इन करें",
  },
  es: {
    brand: "Covalent",
    badge: "Motor CRDT y WebSocket Binario",
    heroTitle: "Espacio de Colaboración en Tiempo Real",
    heroSubtitle: "Edita documentos simultáneamente, sigue cursores en vivo en milisegundos y trabaja sin conexión.",
    feat1Title: "Sincronización Binaria",
    feat1Desc: "90% menos ancho de banda",
    feat2Title: "Cursores en Vivo",
    feat2Desc: "Presencia con Redis Pub/Sub",
    feat3Title: "Primero Offline",
    feat3Desc: "Fusión automática de estado",
    recruiterTitle: "¿Reclutador o Líder Técnico?",
    recruiterDesc: "Omite el registro y entra directamente a un espacio de ingeniería compartido.",
    demoBtn: "Iniciar Demo en Vivo",
    orDivider: "O continúa con tus credenciales",
    nameLabel: "Nombre Completo",
    emailLabel: "Correo Electrónico",
    passLabel: "Contraseña",
    loginBtn: "Iniciar Sesión",
    registerBtn: "Crear Cuenta",
    switchToRegister: "¿Nuevo en Covalent? Crea una cuenta",
    switchToLogin: "¿Ya tienes cuenta? Inicia sesión",
  },
  fr: {
    brand: "Covalent",
    badge: "Moteur CRDT & WebSocket Binaire",
    heroTitle: "Espace de Collaboration en Temps Réel",
    heroSubtitle: "Co-éditez des documents simultanément, suivez les curseurs en direct et travaillez hors ligne.",
    feat1Title: "Synchro Binaire",
    feat1Desc: "90% de bande passante en moins",
    feat2Title: "Curseurs en Direct",
    feat2Desc: "Présence Redis Pub/Sub",
    feat3Title: "Hors-ligne d'abord",
    feat3Desc: "Fusion automatique d'état",
    recruiterTitle: "Recruteur ou Lead Tech ?",
    recruiterDesc: "Accédez directement à un espace d'ingénierie partagé sans inscription.",
    demoBtn: "Lancer la Démo en Direct",
    orDivider: "Ou continuez avec vos identifiants",
    nameLabel: "Nom Complet",
    emailLabel: "Adresse E-mail",
    passLabel: "Mot de passe",
    loginBtn: "Se Connecter",
    registerBtn: "Créer un Compte",
    switchToRegister: "Nouveau sur Covalent ? Créer un compte",
    switchToLogin: "Déjà un compte ? Se connecter",
  },
  de: {
    brand: "Covalent",
    badge: "CRDT & Binäre WebSocket-Engine",
    heroTitle: "Echtzeit-Kollaborations-Workspace",
    heroSubtitle: "Dokumente gleichzeitig bearbeiten, Live-Cursor verfolgen und nahtlos offline arbeiten.",
    feat1Title: "Binär-Sync",
    feat1Desc: "90% weniger Bandbreite",
    feat2Title: "Live-Cursor",
    feat2Desc: "Redis Pub/Sub Präsenz",
    feat3Title: "Offline-First",
    feat3Desc: "Automatischer Delta-Merge",
    recruiterTitle: "Recruiter oder Tech Lead?",
    recruiterDesc: "Überspringen Sie die Registrierung und testen Sie direkt den Live-Workspace.",
    demoBtn: "Live-Demo Starten",
    orDivider: "Oder mit Zugangsdaten fortfahren",
    nameLabel: "Vollständiger Name",
    emailLabel: "E-Mail-Adresse",
    passLabel: "Passwort",
    loginBtn: "Anmelden",
    registerBtn: "Konto Erstellen",
    switchToRegister: "Neu bei Covalent? Konto erstellen",
    switchToLogin: "Bereits ein Konto? Anmelden",
  },
  ja: {
    brand: "Covalent",
    badge: "CRDT & バイナリWebSocketエンジン",
    heroTitle: "リアルタイム共同編集ワークスペース",
    heroSubtitle: "複数人で同時にドキュメントを編集し、ライブカーソルを追跡、オフラインでもシームレスに作業できます。",
    feat1Title: "バイナリ同期",
    feat1Desc: "帯域幅を90%削減",
    feat2Title: "ライブカーソル",
    feat2Desc: "Redis Pub/Sub プレゼンス",
    feat3Title: "オフライン対応",
    feat3Desc: "自動デルタ状態マージ",
    recruiterTitle: "採用担当者・テックリードの方へ",
    recruiterDesc: "登録不要でワンクリックで共有ワークスペースのライブデモを体験できます。",
    demoBtn: "ワンクリックでライブデモを開始",
    orDivider: "またはアカウントでログイン",
    nameLabel: "氏名",
    emailLabel: "メールアドレス",
    passLabel: "パスワード",
    loginBtn: "ログイン",
    registerBtn: "新規アカウント作成",
    switchToRegister: "初めての方はアカウント作成",
    switchToLogin: "すでにアカウントをお持ちの方",
  },
  ko: {
    brand: "Covalent",
    badge: "CRDT 및 바이너리 WebSocket 엔진",
    heroTitle: "충돌 없는 실시간 협업 워크스페이스",
    heroSubtitle: "문서를 동시에 공동 편집하고, 밀리초 단위로 라이브 커서를 추적하며, 오프라인에서도 원활하게 작업하세요.",
    feat1Title: "바이너리 동기화",
    feat1Desc: "대역폭 90% 절감",
    feat2Title: "라이브 커서",
    feat2Desc: "Redis Pub/Sub 프레즌스",
    feat3Title: "오프라인 우선",
    feat3Desc: "자동 델타 상태 병합",
    recruiterTitle: "채용 담당자 또는 테크 리드이신가요?",
    recruiterDesc: "회원가입 없이 원클릭으로 공유 엔지니어링 워크스페이스에 바로 입장하세요.",
    demoBtn: "원클릭 라이브 데모 실행",
    orDivider: "또는 계정으로 계속하기",
    nameLabel: "이름",
    emailLabel: "이메일 주소",
    passLabel: "비밀번호",
    loginBtn: "로그인",
    registerBtn: "계정 만들기",
    switchToRegister: "처음이신가요? 계정 만들기",
    switchToLogin: "이미 계정이 있으신가요? 로그인",
  },
  zh: {
    brand: "Covalent",
    badge: "CRDT 与二进制 WebSocket 引擎",
    heroTitle: "无冲突实时协作工作区",
    heroSubtitle: "多人同步编辑文档，毫秒级追踪实时光标，断网状态下也能无缝继续工作。",
    feat1Title: "二进制同步",
    feat1Desc: "节省 90% 带宽",
    feat2Title: "实时光标",
    feat2Desc: "Redis 发布/订阅在线状态",
    feat3Title: "离线优先",
    feat3Desc: "自动增量状态合并",
    recruiterTitle: "招聘官或技术负责人？",
    recruiterDesc: "无需注册，一键直接进入共享工程工作区体验实时协作。",
    demoBtn: "一键启动实时演示",
    orDivider: "或使用账号登录",
    nameLabel: "全名",
    emailLabel: "电子邮箱",
    passLabel: "密码",
    loginBtn: "登录工作区",
    registerBtn: "创建新账号",
    switchToRegister: "新用户？创建账号",
    switchToLogin: "已有账号？立即登录",
  },
  ar: {
    brand: "كوفالنت",
    badge: "محرك CRDT و WebSocket ثنائي",
    heroTitle: "مساحة عمل تعاونية في الوقت الفعلي",
    heroSubtitle: "قم بتحرير المستندات بشكل متزامن، وتتبع المؤشرات الحية في أجزاء من الثانية، واعمل بسلاسة دون اتصال.",
    feat1Title: "مزامنة ثنائية",
    feat1Desc: "استهلاك أقل بنسبة 90%",
    feat2Title: "مؤشرات حية",
    feat2Desc: "حضور فوري عبر Redis",
    feat3Title: "يعمل دون إنترنت",
    feat3Desc: "دمج تلقائي للتغييرات",
    recruiterTitle: "مدير توظيف أو قائد تقني؟",
    recruiterDesc: "تخطى التسجيل وانتقل مباشرة إلى مساحة العمل الهندسية المشتركة.",
    demoBtn: "تشغيل العرض الحي بنقرة واحدة",
    orDivider: "أو المتابعة باستخدام الحساب",
    nameLabel: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    passLabel: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    registerBtn: "إنشاء حساب جديد",
    switchToRegister: "مستخدم جديد؟ أنشئ حساباً",
    switchToLogin: "لديك حساب بالفعل؟ سجل الدخول",
  },
  pt: {
    brand: "Covalent",
    badge: "Motor CRDT & WebSocket Binário",
    heroTitle: "Workspace de Colaboração em Tempo Real",
    heroSubtitle: "Edite documentos simultaneamente, acompanhe cursores ao vivo e trabalhe offline sem interrupções.",
    feat1Title: "Sincronização Binária",
    feat1Desc: "90% menos largura de banda",
    feat2Title: "Cursores ao Vivo",
    feat2Desc: "Presença Redis Pub/Sub",
    feat3Title: "Offline-First",
    feat3Desc: "Mesclagem automática",
    recruiterTitle: "Recrutador ou Tech Lead?",
    recruiterDesc: "Pule o cadastro e entre direto em um workspace compartilhado.",
    demoBtn: "Iniciar Demo ao Vivo",
    orDivider: "Ou continue com suas credenciais",
    nameLabel: "Nome Completo",
    emailLabel: "E-mail",
    passLabel: "Senha",
    loginBtn: "Entrar",
    registerBtn: "Criar Conta",
    switchToRegister: "Novo no Covalent? Crie uma conta",
    switchToLogin: "Já tem conta? Entrar",
  },
  ru: {
    brand: "Covalent",
    badge: "CRDT и Бинарный WebSocket Движок",
    heroTitle: "Рабочее пространство реального времени",
    heroSubtitle: "Редактируйте документы совместно, отслеживайте курсоры в реальном времени и работайте офлайн.",
    feat1Title: "Бинарная синхр.",
    feat1Desc: "На 90% меньше трафика",
    feat2Title: "Живые курсоры",
    feat2Desc: "Redis Pub/Sub статус",
    feat3Title: "Офлайн-режим",
    feat3Desc: "Авто-слияние изменений",
    recruiterTitle: "Рекрутер или Тимлид?",
    recruiterDesc: "Войдите в общее рабочее пространство в один клик без регистрации.",
    demoBtn: "Запустить живое демо",
    orDivider: "Или войдите через аккаунт",
    nameLabel: "Полное имя",
    emailLabel: "Электронная почта",
    passLabel: "Пароль",
    loginBtn: "Войти",
    registerBtn: "Создать аккаунт",
    switchToRegister: "Нет аккаунта? Зарегистрироваться",
    switchToLogin: "Уже есть аккаунт? Войти",
  },
  it: {
    brand: "Covalent",
    badge: "Motore CRDT & WebSocket Binario",
    heroTitle: "Workspace Collaborativo in Tempo Reale",
    heroSubtitle: "Modifica documenti insieme, traccia i cursori in diretta e lavora offline senza problemi.",
    feat1Title: "Sync Binario",
    feat1Desc: "90% di banda in meno",
    feat2Title: "Cursori Live",
    feat2Desc: "Presenza Redis Pub/Sub",
    feat3Title: "Offline-First",
    feat3Desc: "Merge automatico",
    recruiterTitle: "Recruiter o Tech Lead?",
    recruiterDesc: "Salta la registrazione ed entra subito nel workspace condiviso.",
    demoBtn: "Avvia Demo Live",
    orDivider: "Oppure accedi con il tuo account",
    nameLabel: "Nome Completo",
    emailLabel: "Indirizzo Email",
    passLabel: "Password",
    loginBtn: "Accedi",
    registerBtn: "Crea Account",
    switchToRegister: "Nuovo su Covalent? Registrati",
    switchToLogin: "Hai già un account? Accedi",
  },
  tr: {
    brand: "Covalent",
    badge: "CRDT ve İkili WebSocket Motoru",
    heroTitle: "Gerçek Zamanlı Ortak Çalışma Alanı",
    heroSubtitle: "Belgeleri aynı anda düzenleyin, canlı imleçleri izleyin ve çevrimdışı bile kesintisiz çalışın.",
    feat1Title: "İkili Senkronizasyon",
    feat1Desc: "%90 daha az bant genişliği",
    feat2Title: "Canlı İmleçler",
    feat2Desc: "Redis Pub/Sub varlığı",
    feat3Title: "Çevrimdışı Öncelikli",
    feat3Desc: "Otomatik durum birleştirme",
    recruiterTitle: "İşe Alım Uzmanı veya Lider misiniz?",
    recruiterDesc: "Kayıt olmadan tek tıkla ortak mühendislik alanına giriş yapın.",
    demoBtn: "Canlı Demoyu Başlat",
    orDivider: "Veya hesabınızla devam edin",
    nameLabel: "Ad Soyad",
    emailLabel: "E-posta Adresi",
    passLabel: "Şifre",
    loginBtn: "Giriş Yap",
    registerBtn: "Hesap Oluştur",
    switchToRegister: "Hesabınız yok mu? Kayıt olun",
    switchToLogin: "Zaten hesabınız var mı? Giriş yapın",
  },
  nl: {
    brand: "Covalent",
    badge: "CRDT & Binaire WebSocket Engine",
    heroTitle: "Realtime Samenwerkingsruimte",
    heroSubtitle: "Bewerk documenten tegelijkertijd, volg live cursors en werk naadloos offline.",
    feat1Title: "Binaire Sync",
    feat1Desc: "90% minder bandbreedte",
    feat2Title: "Live Cursors",
    feat2Desc: "Redis Pub/Sub aanwezigheid",
    feat3Title: "Offline-First",
    feat3Desc: "Automatische delta-merge",
    recruiterTitle: "Recruiter of Tech Lead?",
    recruiterDesc: "Sla registratie over en bekijk direct de gedeelde werkruimte.",
    demoBtn: "Start Live Demo",
    orDivider: "Of ga verder met inloggegevens",
    nameLabel: "Volledige Naam",
    emailLabel: "E-mailadres",
    passLabel: "Wachtwoord",
    loginBtn: "Inloggen",
    registerBtn: "Account Aanmaken",
    switchToRegister: "Nieuw bij Covalent? Maak een account",
    switchToLogin: "Al een account? Log in",
  },
  pl: {
    brand: "Covalent",
    badge: "Silnik CRDT i Binarny WebSocket",
    heroTitle: "Przestrzeń Robocza Czasu Rzeczywistego",
    heroSubtitle: "Edytuj dokumenty jednocześnie, śledź kursory na żywo i pracuj płynnie w trybie offline.",
    feat1Title: "Synchronizacja Binarna",
    feat1Desc: "90% mniejsze zużycie pasma",
    feat2Title: "Kursory na Żywo",
    feat2Desc: "Obecność Redis Pub/Sub",
    feat3Title: "Offline-First",
    feat3Desc: "Automatyczne scalanie",
    recruiterTitle: "Rekruter lub Tech Lead?",
    recruiterDesc: "Pomiń rejestrację i wejdź bezpośrednio do współdzielonego obszaru.",
    demoBtn: "Uruchom Demo na Żywo",
    orDivider: "Lub zaloguj się danymi",
    nameLabel: "Imię i Nazwisko",
    emailLabel: "Adres E-mail",
    passLabel: "Hasło",
    loginBtn: "Zaloguj się",
    registerBtn: "Utwórz Konto",
    switchToRegister: "Nowy w Covalent? Załóż konto",
    switchToLogin: "Masz już konto? Zaloguj się",
  },
  id: {
    brand: "Covalent",
    badge: "Mesin CRDT & WebSocket Biner",
    heroTitle: "Ruang Kerja Kolaborasi Real-Time",
    heroSubtitle: "Edit dokumen secara bersamaan, lacak kursor langsung dalam milidetik, dan bekerja offline dengan lancar.",
    feat1Title: "Sinkronisasi Biner",
    feat1Desc: "Hemat bandwidth 90%",
    feat2Title: "Kursor Langsung",
    feat2Desc: "Presensi Redis Pub/Sub",
    feat3Title: "Offline-First",
    feat3Desc: "Penggabungan delta otomatis",
    recruiterTitle: "Perekrut atau Tech Lead?",
    recruiterDesc: "Lewati pendaftaran dan langsung masuk ke ruang kerja bersama.",
    demoBtn: "Buka Demo Langsung",
    orDivider: "Atau lanjutkan dengan akun",
    nameLabel: "Nama Lengkap",
    emailLabel: "Alamat Email",
    passLabel: "Kata Sandi",
    loginBtn: "Masuk",
    registerBtn: "Buat Akun",
    switchToRegister: "Baru di Covalent? Buat akun",
    switchToLogin: "Sudah punya akun? Masuk",
  },
  vi: {
    brand: "Covalent",
    badge: "Công cụ CRDT & WebSocket Nhị phân",
    heroTitle: "Không Gian Cộng Tác Thời Gian Thực",
    heroSubtitle: "Đồng chỉnh sửa tài liệu, theo dõi con trỏ trực tiếp và làm việc ngoại tuyến mượt mà.",
    feat1Title: "Đồng bộ nhị phân",
    feat1Desc: "Tiết kiệm 90% băng thông",
    feat2Title: "Con trỏ trực tiếp",
    feat2Desc: "Trạng thái Redis Pub/Sub",
    feat3Title: "Ưu tiên ngoại tuyến",
    feat3Desc: "Tự động hợp nhất dữ liệu",
    recruiterTitle: "Nhà tuyển dụng hoặc Tech Lead?",
    recruiterDesc: "Bỏ qua đăng ký và truy cập ngay vào không gian làm việc chung.",
    demoBtn: "Mở Bản Demo Trực Tiếp",
    orDivider: "Hoặc đăng nhập bằng tài khoản",
    nameLabel: "Họ và Tên",
    emailLabel: "Địa chỉ Email",
    passLabel: "Mật khẩu",
    loginBtn: "Đăng Nhập",
    registerBtn: "Tạo Tài Khoản",
    switchToRegister: "Chưa có tài khoản? Đăng ký ngay",
    switchToLogin: "Đã có tài khoản? Đăng nhập",
  },
  th: {
    brand: "Covalent",
    badge: "เอนจิน CRDT และไบนารี WebSocket",
    heroTitle: "พื้นที่ทำงานร่วมกันแบบเรียลไทม์",
    heroSubtitle: "แก้ไขเอกสารพร้อมกัน ติดตามเคอร์เซอร์สดในเสี้ยววินาที และทำงานแบบออฟไลน์ได้อย่างราบรื่น",
    feat1Title: "ซิงค์แบบไบนารี",
    feat1Desc: "ประหยัดแบนด์วิดท์ 90%",
    feat2Title: "เคอร์เซอร์สด",
    feat2Desc: "สถานะผ่าน Redis Pub/Sub",
    feat3Title: "รองรับออฟไลน์",
    feat3Desc: "รวมข้อมูลอัตโนมัติ",
    recruiterTitle: "ผู้สรรหาบุคลากรหรือ Tech Lead?",
    recruiterDesc: "ข้ามการลงทะเบียนและเข้าสู่พื้นที่ทำงานร่วมกันได้ทันที",
    demoBtn: "เปิดใช้งานเดโมสดทันที",
    orDivider: "หรือเข้าสู่ระบบด้วยบัญชีของคุณ",
    nameLabel: "ชื่อ-นามสกุล",
    emailLabel: "อีเมล",
    passLabel: "รหัสผ่าน",
    loginBtn: "เข้าสู่ระบบ",
    registerBtn: "สร้างบัญชีใหม่",
    switchToRegister: "ยังไม่มีบัญชี? สมัครสมาชิก",
    switchToLogin: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
  },
  ur: {
    brand: "کوویلنٹ",
    badge: "CRDT اور بائنری ویب ساکٹ انجن",
    heroTitle: "ریئل ٹائم کولیبوریشن ورک اسپیس",
    heroSubtitle: "دستاویزات میں بیک وقت ترمیم کریں، لائیو کرسر ٹریک کریں، اور آف لائن بھی بغیر کسی رکاوٹ کے کام کریں۔",
    feat1Title: "بائنری سنک",
    feat1Desc: "90% کم بینڈوتھ",
    feat2Title: "لائیو کرسر",
    feat2Desc: "ریڈیس پب/سب موجودگی",
    feat3Title: "آف لائن فرسٹ",
    feat3Desc: "خودکار ڈیلٹا انضمام",
    recruiterTitle: "ریکروٹر یا ٹیک لیڈ؟",
    recruiterDesc: "رجسٹریشن کے بغیر ایک کلک میں مشترکہ انجینئرنگ ورک اسپیس میں داخل ہوں۔",
    demoBtn: "لائیو ڈیمو شروع کریں",
    orDivider: "یا اپنے اکاؤنٹ سے جاری رکھیں",
    nameLabel: "پورا نام",
    emailLabel: "ای میل ایڈریس",
    passLabel: "پاس ورڈ",
    loginBtn: "سائن ان کریں",
    registerBtn: "نیا اکاؤنٹ بنائیں",
    switchToRegister: "نئے صارف ہیں؟ اکاؤنٹ بنائیں",
    switchToLogin: "پہلے سے اکاؤنٹ ہے؟ سائن ان کریں",
  },
};

interface LanguageContextType {
  currentLang: LanguageItem;
  setLanguage: (code: string) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const listeners = new Set<() => void>();

function subscribeLang(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getLangSnapshot(): string {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("covalent_lang");
  return saved && DICTIONARY[saved] ? saved : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const langCode = useSyncExternalStore(subscribeLang, getLangSnapshot, () => "en");

  const currentLang = TOP_20_LANGUAGES.find((l) => l.code === langCode) || TOP_20_LANGUAGES[0];

  useEffect(() => {
    document.documentElement.dir = currentLang.dir || "ltr";
    document.documentElement.lang = currentLang.code;
  }, [currentLang]);

  const setLanguage = (code: string) => {
    if (DICTIONARY[code]) {
      localStorage.setItem("covalent_lang", code);
      listeners.forEach((fn) => fn());
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t: DICTIONARY[langCode] || DICTIONARY.en }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}