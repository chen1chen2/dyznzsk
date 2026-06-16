import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Files,
  Folder,
  FolderKanban,
  Globe,
  Home,
  Languages,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ThumbsDown,
  Trash2,
  Upload,
  UserRound,
  Wrench,
  X as XIcon,
} from "lucide-react";
import { KnowledgeBaseModal } from "./components/knowledge-base-modal";
import {
  AttachmentUploadModal,
  type AttachmentFile,
} from "./components/attachment-upload-modal";

type Conversation = {
  id: string;
  title: string;
  group: string;
  active?: boolean;
};

type HitDocument = {
  id: string;
  knowledgeBase: string;
  name: string;
  level: string;
  languages: string[];
  updatedAt: string;
  snippet: string;
  hitText: string;
  originalTitle: string;
  translatedTitle: string;
  originalParagraphs: string[];
  translatedParagraphs: string[];
  versions?: string[];
};

const initialConversations: Conversation[] = [
  { id: "1", title: "知识库问答", group: "今天", active: true },
  { id: "2", title: "重新提问惊喜", group: "七天内" },
  { id: "3", title: "身份询问", group: "30天内" },
  { id: "4", title: "知识图谱生成", group: "30天内" },
  { id: "5", title: "电影节主办方", group: "2026-4" },
];

const groups = ["今天", "七天内", "30天内", "2026-4"];

const quickQuestionItems = [
  {
    label: "知识图谱",
    question: "根据关联文档，生成文档知识图谱",
    icon: Database,
    sendImmediately: true,
    openCitation: false,
  },
  {
    label: "文件概述",
    question: "根据关联文档，生成文档概述",
    icon: FileText,
    sendImmediately: true,
    openCitation: false,
  },
  {
    label: "翻译建议",
    question: "根据关联文档，生成翻译建议",
    icon: Languages,
    sendImmediately: true,
    openCitation: false,
  },
];

const hitDocuments: HitDocument[] = [
  {
    id: "beijing-film-bilingual",
    knowledgeBase: "测试知识库",
    name: "第12届北京国际电影节主视觉揭晓-“同心·笃行”原文-中英段段对照.docx",
    level: "1 - 公开",
    languages: ["中", "英"],
    updatedAt: "2026-05-19 14:21:48",
    snippet:
      "第12届北京国际电影节主视觉揭晓，主打中国红，The main visual for the 12th Beijing International Film Festival unveiled, featuring Chinese red...",
    hitText: "天坛奖",
    originalTitle: "第12届北京国际电影节主视觉揭晓",
    translatedTitle: "The Main Visual of the 12th Beijing International Film Festival Unveiled",
    originalParagraphs: [
      "第12届北京国际电影节主视觉揭晓，主打中国红，呈现电影节开放、包容、交流的精神气质。",
      "本届北京国际电影节设有“天坛奖”评奖单元，邀请来自全球的电影创作者共同参与。",
      "“天坛奖”在英文中通常翻译为 “Tiantan Award”，其中 Tian Tan 指北京著名地标天坛，Award 表示奖项。",
      "电影节期间将举办开幕式、北京展映、北京市场、电影嘉年华、大学生电影节等主体板块。",
    ],
    translatedParagraphs: [
      "The main visual for the 12th Beijing International Film Festival was unveiled, featuring Chinese red and presenting the festival's spirit of openness, inclusiveness, and exchange.",
      "This year's Beijing International Film Festival includes the Tiantan Award competition section, inviting filmmakers from around the world to participate.",
      "“天坛奖” is commonly translated into English as “Tiantan Award”, in which Tian Tan refers to Beijing's famous Temple of Heaven and Award means a prize.",
      "During the festival, major sections such as the opening ceremony, Beijing Film Panorama, Beijing Market, Film Carnival, and College Student Film Festival will be held.",
    ],
    versions: ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"],
  },
  {
    id: "beijing-film-original",
    knowledgeBase: "测试知识库",
    name: "第12届北京国际电影节主视觉揭晓-“同心·笃行”原文.docx",
    level: "2 - 内部",
    languages: ["中"],
    updatedAt: "2026-04-14 03:40:02",
    snippet:
      "第12届北京国际电影节主视觉揭晓，主打中国红，活动设置包括天坛奖评奖、北京展映、北京市场等。",
    hitText: "天坛奖",
    originalTitle: "第12届北京国际电影节主视觉揭晓",
    translatedTitle: "The Main Visual of the 12th Beijing International Film Festival Unveiled",
    originalParagraphs: [
      "第12届北京国际电影节主视觉揭晓，主打中国红，体现光影同心、笃行向前的主题。",
      "天坛奖评奖单元面向全球征集优秀影片，评委会将从艺术表达、技术完成度和文化价值等维度综合评审。",
      "北京展映、北京市场、电影嘉年华等活动将同步开展，为行业交流和观众观影提供丰富场景。",
    ],
    translatedParagraphs: [
      "The main visual of the 12th Beijing International Film Festival was unveiled, featuring Chinese red and expressing the theme of moving forward together through cinema.",
      "The Tiantan Award competition section collects outstanding films worldwide, and the jury evaluates them by artistic expression, technical completion, and cultural value.",
      "Beijing Film Panorama, Beijing Market, Film Carnival, and other activities will run in parallel, offering rich opportunities for industry exchange and public screenings.",
    ],
  },
];

const getDocumentById = (id: string | null) =>
  hitDocuments.find((doc) => doc.id === id) ?? hitDocuments[0];

const formatSecurityLevel = (level: string) =>
  level.replace(/^\s*\d+\s*-\s*/, "");

function SecurityBadge({ level }: { level: string }) {
  const isInternal = level.includes("内部");
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[12px] leading-4 ${
        isInternal
          ? "border-[#fed7aa] bg-[#fff7ed] text-[#f97316]"
          : "border-[#a7f3d0] bg-[#ecfdf5] text-[#10b981]"
      }`}
    >
      <ShieldCheck className="h-3 w-3" />
      {formatSecurityLevel(level)}
    </span>
  );
}

function LanguageTags({ languages }: { languages: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {languages.map((language) => (
        <span
          key={language}
          className="inline-flex h-5 shrink-0 items-center rounded border border-[#bfdbfe] bg-[#eff6ff] px-1.5 text-[12px] leading-4 text-[#2563eb]"
        >
          {language}
        </span>
      ))}
    </span>
  );
}

function SourceMarker({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="查看命中文件"
      className="ml-1 inline-flex h-5 min-w-5 translate-y-0.5 items-center justify-center rounded-full border border-[#93c5fd] bg-[#eff6ff] px-1.5 text-[11px] font-medium leading-none text-[#2563eb] shadow-sm hover:border-[#60a5fa] hover:bg-[#dbeafe]"
    >
      <Link2 className="h-3 w-3" />
      <span className="ml-0.5">{count}</span>
    </button>
  );
}

function HighlightText({ text, hitText }: { text: string; hitText: string }) {
  if (!hitText || !text.includes(hitText)) return <>{text}</>;
  const parts = text.split(hitText);
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <mark className="rounded bg-[#fff2a8] px-0.5 text-[#1f2329]">
              {hitText}
            </mark>
          )}
        </span>
      ))}
    </>
  );
}

function DocumentPreviewPage() {
  const params = new URLSearchParams(window.location.search);
  const doc = getDocumentById(params.get("doc"));
  const [view, setView] = useState<"parallel" | "original" | "translated">("parallel");
  const isHitSlice = (paragraph: string) =>
    paragraph.includes(doc.hitText) || paragraph.includes("Tiantan Award");

  const renderPage = (title: string, paragraphs: string[], align: "left" | "center") => (
    <section className="min-h-[calc(100vh-110px)] rounded-sm border border-[#dfe3ea] bg-white px-16 py-20 shadow-[0_1px_8px_rgba(20,20,43,0.08)]">
      <h1 className={`mb-8 text-[22px] font-medium text-[#1f2329] ${align === "center" ? "text-center" : ""}`}>
        {title}
      </h1>
      <div className={`space-y-6 text-[16px] leading-8 text-[#1f2329] ${align === "center" ? "text-center" : ""}`}>
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={
              isHitSlice(paragraph)
                ? "rounded-md bg-[#fff2a8] px-2 py-1 text-[#1f2329]"
                : undefined
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#1f2329]">
      <header className="sticky top-0 z-20 flex h-13 items-center justify-center border-b border-[#e5e7ec] bg-white/90 px-5 backdrop-blur">
        <div className="inline-flex rounded-lg bg-[#f1f3f6] p-1">
          {[
            { key: "parallel", label: "原译对照" },
            { key: "original", label: "原文" },
            { key: "translated", label: "译文" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as "parallel" | "original" | "translated")}
              className={`rounded-md px-5 py-1.5 text-[13px] ${
                view === tab.key ? "bg-white text-[#1f2329] shadow-sm" : "text-[#6b7280] hover:text-[#1f2329]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="absolute right-5 flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7ec] bg-white px-3 py-1.5 text-[13px] text-[#3a4150] hover:bg-[#f8fafc]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7ec] bg-white px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-[#fef2f2]"
          >
            <XIcon className="h-3.5 w-3.5" />
            退出预览
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1780px] gap-8 px-8 py-8">
        {view === "parallel" && (
          <div className="grid grid-cols-[1fr_8px_1fr] gap-8">
            {renderPage(doc.originalTitle, doc.originalParagraphs, "center")}
            <div className="rounded-full bg-[#c9cdd4]" />
            {renderPage(doc.translatedTitle, doc.translatedParagraphs, "center")}
          </div>
        )}
        {view === "original" && <div className="mx-auto w-full max-w-[900px]">{renderPage(doc.originalTitle, doc.originalParagraphs, "center")}</div>}
        {view === "translated" && <div className="mx-auto w-full max-w-[900px]">{renderPage(doc.translatedTitle, doc.translatedParagraphs, "center")}</div>}
      </main>
    </div>
  );
}

function CitationPanel({
  open,
  onClose,
  documents,
}: {
  open: boolean;
  onClose: () => void;
  documents: HitDocument[];
}) {
  if (!open) return null;

  const openPreview = (event: React.MouseEvent<HTMLAnchorElement>, doc: HitDocument) => {
    event.preventDefault();
    const url = `/document-preview?doc=${encodeURIComponent(doc.id)}&hit=${encodeURIComponent(doc.hitText)}`;
    const previewWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!previewWindow) {
      window.location.assign(url);
    }
  };

  return (
    <aside className="flex w-[clamp(360px,30vw,520px)] shrink-0 flex-col border-l border-[#eef0f3] bg-white px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f3f6] text-[#6b7280] hover:bg-[#e5e7ec] hover:text-[#1f2329]"
            title="关闭引用内容"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[15px] font-medium text-[#1f2329]">引用内容</div>
            <div className="mt-0.5 text-[12px] text-[#9098a4]">命中 {documents.length} 个文件</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={`/document-preview?doc=${encodeURIComponent(doc.id)}&hit=${encodeURIComponent(doc.hitText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => openPreview(event, doc)}
            className="block w-full rounded-lg border border-transparent p-3 text-left hover:border-[#dbeafe] hover:bg-[#f8fbff]"
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-[12px] text-[#6b7280]">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" />
                <span className="truncate">知识库：{doc.knowledgeBase}</span>
              </span>
              <span className="shrink-0">{doc.updatedAt}</span>
            </div>
            <div className="mb-2 flex items-start gap-2">
              <div className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-[#1f2329]">
                {doc.name}
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9098a4]" />
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <SecurityBadge level={doc.level} />
              <LanguageTags languages={doc.languages} />
              {doc.versions && doc.versions.length > 1 && (
                <span
                  title={`历史版本：${doc.versions.join("、")}`}
                  className="inline-flex shrink-0 items-center rounded border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] leading-4 text-[#2563eb]"
                >
                  最新版本 {doc.versions.at(-1)}
                </span>
              )}
            </div>
            <p className="line-clamp-3 text-[12px] leading-5 text-[#6b7280]">
              <HighlightText text={doc.snippet} hitText={doc.hitText} />
            </p>
          </a>
        ))}
      </div>
    </aside>
  );
}

const primaryNavigation = [
  { label: "首页", icon: Home },
  { label: "文档快翻", icon: Files },
];

const secondaryNavigation = [
  { label: "AI 工具包", icon: Wrench },
  { label: "系统管理", icon: Settings, expandable: true },
];

function EnterpriseShell({
  children,
  onOpenTranslate,
}: {
  children: React.ReactNode;
  onOpenTranslate: () => void;
}) {
  return (
    <div className="flex h-screen min-w-[1240px] flex-col overflow-hidden bg-[#f0f2f5] text-[#333]">
      <header className="flex h-14 shrink-0 items-center border-b border-[#f2f3f5] bg-white px-4">
        <div className="flex w-[204px] shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#00c6f3] to-[#64d8ff] text-white shadow-sm">
            <Languages className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold text-[#333]">智能翻译系统</span>
        </div>

        <div className="relative w-[320px]">
          <input
            type="search"
            aria-label="搜索全部术语或语料"
            placeholder="搜索全部术语/语料"
            className="h-8 w-full rounded-md border border-transparent bg-[#f9fafc] px-3 pr-9 text-[13px] text-[#333] outline-none transition-colors placeholder:text-[#bfbfbf] focus:border-[#8ce8fb] focus:bg-white"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
        </div>
        <span className="ml-3 rounded border border-[#eee] bg-white px-2 py-0.5 text-[11px] text-[#999]">
          机器
        </span>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            title="用户中心"
            aria-label="打开用户中心"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#bdf4ff] to-[#20c6ee] text-white shadow-sm ring-2 ring-[#e8fbff] hover:brightness-95"
          >
            <UserRound className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[220px] shrink-0 border-r border-[#f2f3f5] bg-white px-3 py-4">
          <nav aria-label="主导航" className="space-y-1">
            {primaryNavigation.map(({ label, icon: Icon, expandable }) => (
              <button
                key={label}
                type="button"
                onClick={label === "文档快翻" ? onOpenTranslate : undefined}
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-[14px] text-[#555] hover:bg-[rgba(0,198,243,.04)] hover:text-[#00b4fa]"
              >
                <Icon className="mr-3 h-4 w-4 text-[#41bde8]" />
                <span>{label}</span>
                {expandable && <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#999]" />}
              </button>
            ))}

            <div>
              <button
                type="button"
                aria-expanded="true"
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-[14px] text-[#555] hover:bg-[rgba(0,198,243,.04)] hover:text-[#00b4fa]"
              >
                <FolderKanban className="mr-3 h-4 w-4 text-[#41bde8]" />
                <span>项目管理</span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 rotate-180 text-[#999]" />
              </button>
              <button
                type="button"
                aria-current="page"
                className="relative mt-1 flex h-10 w-full items-center rounded-md bg-[#e8f9fe] pl-10 pr-3 text-left text-[14px] font-semibold text-[#00aeda]"
              >
                <span className="absolute left-5 h-1.5 w-1.5 rounded-full bg-[#00c6f3]" />
                智能问答
              </button>
            </div>

            <div>
              <button
                type="button"
                aria-expanded="true"
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-[14px] text-[#555] hover:bg-[rgba(0,198,243,.04)] hover:text-[#00b4fa]"
              >
                <Database className="mr-3 h-4 w-4 text-[#41bde8]" />
                <span>语言资产</span>
                <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#999]" />
              </button>
              <div className="space-y-1 py-1 pl-10 text-[13px] text-[#666]">
                <button type="button" className="block h-8 hover:text-[#00b4fa]">术语库</button>
                <button type="button" className="block h-8 hover:text-[#00b4fa]">语料库</button>
              </div>
            </div>

            {secondaryNavigation.map(({ label, icon: Icon, expandable }) => (
              <button
                key={label}
                type="button"
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-[14px] text-[#555] hover:bg-[rgba(0,198,243,.04)] hover:text-[#00b4fa]"
              >
                <Icon className="mr-3 h-4 w-4 text-[#41bde8]" />
                <span>{label}</span>
                {expandable && <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#999]" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-[#f0f2f5] p-4">
          <section
            aria-label="知识库问答工作区"
            className="h-full min-h-0 overflow-hidden rounded-lg bg-white shadow-[0_1px_10px_rgba(32,22,120,0.04)]"
          >
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

const formatTypes = [
  { label: "Word", color: "from-[#7ab8ff] to-[#3f8df1]", icon: "W" },
  { label: "Excel", color: "from-[#80db8d] to-[#37bd5a]", icon: "X" },
  { label: "PPT", color: "from-[#ffb05f] to-[#f47b2c]", icon: "P" },
  { label: "WPS", color: "from-[#ff8f6f] to-[#f45b3d]", icon: "W" },
  { label: "PDF", color: "from-[#ff8f70] to-[#e95a42]", icon: "PDF" },
  { label: "TXT", color: "from-[#c8d2df] to-[#93a1b5]", icon: "TXT" },
  { label: "SRT", color: "from-[#9b8cff] to-[#6d5cf5]", icon: "SRT" },
  { label: "CAD", color: "from-[#ff9fd6] to-[#ef6fb4]", icon: "DXF" },
  { label: "XLIFF", color: "from-[#84d9c8] to-[#32b69f]", icon: "XLF" },
  { label: "ZIP", color: "from-[#ffc06e] to-[#f59e0b]", icon: "ZIP" },
  { label: "文件夹", color: "from-[#8bd4ff] to-[#3aa8ef]", icon: "" },
  { label: "更多格式", color: "from-[#b5f0ff] to-[#7dd8ef]", icon: "" },
];

const translateRecords = [
  ["BIOS0629-109_中文原文.docx", "公开", "2026.06.15 15:55", "中 - 英", "传神多语", "21087", "解析完成", "翻译完成"],
  ["制剂的质量控制1234.docx", "公开", "2026.06.15 15:55", "中 - 英", "传神多语", "7315", "解析完成", "翻译完成"],
  ["附件1.pdf", "公开", "2026.06.12 15:35", "中 - 英", "传神多语", "13134", "解析完成", "翻译完成"],
  ["制剂的质量控制1234.pdf", "公开", "2026.06.12 13:20", "中 - 英", "传神多语", "7542", "解析完成", "翻译完成"],
  ["世界の船舶2026年5月号.pdf", "公开", "2026.06.11 18:17", "日 - 中", "传神多语", "124027", "解析完成", "翻译完成"],
  ["世界の船舶2026年5月号.pdf", "公开", "2026.06.11 16:47", "日 - 中", "传神多语", "-", "解析失败", "翻译失败"],
  ["世界の船舶2026年4月号.pdf", "公开", "2026.06.11 16:47", "日 - 中", "传神多语", "122171", "解析完成", "翻译完成"],
  ["世界の船舶2026年4月号.pdf", "公开", "2026.06.11 09:31", "日 - 中", "传神多语", "-", "解析失败", "翻译失败"],
  ["世界の船舶2026年5月号.pdf", "公开", "2026.06.11 09:31", "日 - 中", "传神多语", "-", "解析失败", "翻译失败"],
  ["01 洗碗机说明书_扫描版-1.pdf", "内部", "2026.06.04 20:56", "中 - 英", "传神多语", "3977", "解析完成", "翻译完成"],
];

const summaryByFileName: Record<string, { overview: string; points: string[] }> = {
  "BIOS0629-109_中文原文.docx": {
    overview:
      "该文档主要描述 BIOS 升级、设备初始化、接口检查和异常处理流程，可用于翻译前快速识别硬件与固件相关术语。",
    points: ["BIOS 升级步骤", "接口初始化", "异常告警", "固件版本校验"],
  },
  "制剂的质量控制1234.docx": {
    overview:
      "该文档围绕制剂质量控制、检验标准、批次记录和稳定性测试展开，适合作为药品质量体系术语参考。",
    points: ["质量控制", "稳定性测试", "批次记录", "检验标准"],
  },
  "附件1.pdf": {
    overview:
      "该附件汇总项目交付材料、检测说明和关键参数，可辅助问答场景定位引用来源。",
    points: ["交付材料", "检测说明", "关键参数"],
  },
};

function SidebarItem({
  active,
  children,
  icon: Icon,
  expanded,
}: {
  active?: boolean;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex h-9 w-full items-center rounded-md px-3 text-left text-[14px] ${
        active ? "bg-[#dff5fd] font-semibold text-[#333]" : "text-[#555] hover:bg-[rgba(0,198,243,.04)]"
      }`}
    >
      <Icon className="mr-3 h-4 w-4 text-[#3dbce8]" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {expanded !== undefined && (
        <ChevronDown className={`h-3.5 w-3.5 text-[#999] ${expanded ? "rotate-180" : ""}`} />
      )}
    </button>
  );
}

function FileFormatIcon({ item }: { item: (typeof formatTypes)[number] }) {
  const isFolder = item.label === "文件夹";
  const isMore = item.label === "更多格式";
  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-1 text-center">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${item.color} text-[9px] font-bold text-white shadow-sm`}
      >
        {isFolder ? <Folder className="h-4 w-4" /> : isMore ? <Files className="h-4 w-4" /> : item.icon}
      </span>
      <span className="text-[11px] leading-4 text-[#b8bdc6]">{item.label}</span>
    </div>
  );
}

function TranslationFileNameCell({
  name,
  summaryStatus,
}: {
  name: string;
  summaryStatus: "generating" | "done" | "none";
}) {
  const summary = summaryByFileName[name];
  const canPreview = summaryStatus === "done" && Boolean(summary);
  const outlineSummaryIcon = (loading = false, tooltip?: string) => (
    <span
      className={`inline-flex h-[22px] w-[38px] shrink-0 items-center justify-center rounded-md border border-[#00befa] bg-white text-[11px] font-semibold leading-none text-[#00aeda] ${
        loading ? "animate-pulse shadow-[0_0_0_2px_rgba(0,190,250,0.12)]" : ""
      }`}
      title={tooltip}
    >
      概述
    </span>
  );

  return (
    <div className="group relative flex min-w-0 items-center gap-1.5">
      <span
        className={`min-w-0 truncate ${canPreview ? "group-hover:text-[#00aeda]" : ""}`}
        title={name}
      >
        {name}
      </span>
      {summaryStatus === "generating" && (
        <span
          className="inline-flex h-[22px] shrink-0 items-center rounded-md text-[#00aeda]"
          title="概述与知识点生成中..."
          aria-label="概述与知识点生成中..."
        >
          {outlineSummaryIcon(true, "概述与知识点生成中...")}
        </span>
      )}
      {canPreview && (
        <span
          className="relative inline-flex h-[22px] w-[38px] shrink-0 items-center justify-center"
          title="概述与知识点生成完成"
          aria-label="概述与知识点生成完成"
        >
          {outlineSummaryIcon()}
          <CheckCircle2 className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white text-[#10b981]" />
        </span>
      )}
      {canPreview && summary && (
        <div className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-[360px] rounded-lg border border-[#e5e7ec] bg-white p-3 text-left shadow-xl group-hover:block">
          <p className="whitespace-normal text-[12px] leading-5 text-[#3a4150]">
            {summary.overview}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {summary.points.map((point) => (
              <span
                key={point}
                className="inline-flex h-5 items-center rounded border border-[#b5effb] bg-[#e8f9fe] px-1.5 text-[12px] text-[#00aeda]"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentFastTranslatePage({ onOpenKnowledgeQa }: { onOpenKnowledgeQa: () => void }) {
  const [selectedDocIndexes, setSelectedDocIndexes] = useState<Set<number>>(() => new Set());
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [generatingSummaryNames, setGeneratingSummaryNames] = useState<Set<string>>(
    () => new Set([translateRecords[0][0]]),
  );
  const allDocsSelected = selectedDocIndexes.size === translateRecords.length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGeneratingSummaryNames((previous) => {
        const next = new Set(previous);
        next.delete(translateRecords[0][0]);
        return next;
      });
    }, 12000);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleDocSelection = (index: number) => {
    setSelectedDocIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAllDocs = () => {
    setSelectedDocIndexes((prev) =>
      prev.size === translateRecords.length
        ? new Set()
        : new Set(translateRecords.map((_, index) => index)),
    );
  };

  return (
    <div className="flex h-screen min-w-[1240px] flex-col overflow-hidden bg-[#f0f2f5] text-[#333]">
      <header className="flex h-14 shrink-0 items-center border-b border-[#f2f3f5] bg-white px-4">
        <div className="flex w-[204px] shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#4ec6ff] to-[#158fff] text-white shadow-sm">
            <Languages className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold text-[#333]">智能翻译系统</span>
        </div>
        <div className="relative w-[320px]">
          <input
            aria-label="搜索全部术语或语料"
            placeholder="搜索全部术语/语料"
            className="h-8 w-full rounded-md border border-transparent bg-[#f9fafc] px-3 pr-9 text-[13px] outline-none placeholder:text-[#c2c7d0] focus:border-[#8ce8fb] focus:bg-white"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
        </div>
        <span className="ml-3 rounded border border-[#eee] bg-white px-2 py-0.5 text-[11px] text-[#999]">机器</span>
        <button
          type="button"
          aria-label="打开用户中心"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#a5edff] to-[#19bdf0] text-white shadow-sm"
        >
          <UserRound className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`relative shrink-0 overflow-visible bg-white transition-[width,padding,border-color] duration-200 ${
            qaDrawerOpen || sidebarCollapsed ? "w-0 border-r-0 px-0 py-3" : "w-[220px] px-3 py-3"
          }`}
          aria-hidden={qaDrawerOpen}
        >
          {!qaDrawerOpen && (
            <button
              type="button"
              aria-label={sidebarCollapsed ? "展开侧栏" : "收起侧栏"}
              title={sidebarCollapsed ? "展开侧栏" : "收起侧栏"}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#edf0f4] bg-white text-[#999] shadow-sm hover:border-[#8ce8fb] hover:text-[#00b4fa]"
            >
              {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          )}
          {!sidebarCollapsed && !qaDrawerOpen && (
            <nav className="w-[196px] space-y-1 transition-opacity duration-150" aria-label="主导航">
              <SidebarItem icon={Home}>首页</SidebarItem>
              <SidebarItem icon={Files} active>文档快翻</SidebarItem>
              <SidebarItem icon={FolderKanban} expanded>项目管理</SidebarItem>
              <div className="space-y-1 py-1 pl-10 text-[13px] text-[#666]">
                <button
                  type="button"
                  onClick={onOpenKnowledgeQa}
                  className="block h-8 hover:text-[#00b4fa]"
                >
                  智能问答
                </button>
              </div>
              <SidebarItem icon={Database} expanded>语言资产</SidebarItem>
              <div className="space-y-1 py-1 pl-10 text-[13px] text-[#666]">
                <button type="button" className="block h-8 hover:text-[#00b4fa]">术语库</button>
                <button type="button" className="block h-8 hover:text-[#00b4fa]">语料库</button>
              </div>
              <SidebarItem icon={Wrench}>工具包</SidebarItem>
              <SidebarItem icon={Settings} expanded={false}>系统管理</SidebarItem>
            </nav>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f0f2f5] px-5 py-5">
          <div className="mb-4 flex h-10 items-end gap-1">
            {["文档翻译", "文本翻译", "图片翻译"].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`h-10 rounded-t-md px-8 text-[14px] ${
                  index === 0 ? "bg-white font-semibold text-[#333]" : "bg-[#f5f6f8] text-[#999] hover:text-[#00b4fa]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="mb-4 rounded-xl bg-white p-5 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
            <div className="flex h-[238px] flex-col items-center justify-center rounded-lg border border-dashed border-[#92e8fb] bg-white">
              <div className="mb-5 flex items-start gap-3">
                {formatTypes.map((item) => <FileFormatIcon key={item.label} item={item} />)}
              </div>
              <div className="text-[16px] font-medium text-[#555]">拖拽文档到此进行翻译</div>
              <div className="mt-2 text-[13px] text-[#aaa]">单个文件≤1024M</div>
              <div className="mt-4 flex items-center gap-4">
                <button type="button" className="inline-flex h-8 min-w-[120px] items-center justify-center whitespace-nowrap rounded-md border border-[#eee] bg-white px-7 text-[13px] text-[#555] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  上传文档
                </button>
                <button type="button" className="inline-flex h-8 min-w-[120px] items-center justify-center whitespace-nowrap rounded-md border border-[#eee] bg-white px-7 text-[13px] text-[#555] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                  <Folder className="mr-1.5 h-3.5 w-3.5" />
                  上传文件夹
                </button>
              </div>
            </div>
          </section>

          <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[#333]">
            <Clock3 className="h-4 w-4" />
            翻译记录
          </div>

          <section className="rounded-xl bg-white p-5 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <input
                placeholder="文件名称"
                className="h-8 w-[200px] rounded-md border border-[#eee] px-3 text-[13px] outline-none placeholder:text-[#c7cbd2] focus:border-[#8ce8fb]"
              />
              <button type="button" className="flex h-8 w-[116px] items-center justify-between rounded-md border border-[#eee] px-3 text-[13px] text-[#999]">
                翻译进度
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="h-8 rounded-md bg-[#00befa] px-5 text-[13px] text-white hover:bg-[#00b4fa]">查询</button>
              <button type="button" className="h-8 rounded-md border border-[#eee] bg-white px-5 text-[13px] text-[#555] hover:border-[#00c6f3] hover:text-[#00b4fa]">重置</button>
              <button
                type="button"
                onClick={() => setQaDrawerOpen(true)}
                className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-[#00befa] px-4 text-[13px] text-white hover:bg-[#00b4fa]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                智能问答
              </button>
            </div>

            <div className="overflow-hidden rounded-sm">
              <table className="w-full table-fixed border-collapse text-[14px] leading-5">
                <thead className="bg-[#f9fafc] text-left text-[#666]">
                  <tr>
                    <th className="h-10 w-[44px] px-3 font-medium">
                      <input
                        type="checkbox"
                        aria-label="全选文件"
                        checked={allDocsSelected}
                        onChange={toggleAllDocs}
                        className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                      />
                    </th>
                    {["文件名称", "涉密等级", "日期", "语种方向", "使用引擎", "字数", "文件状态", "翻译进度", "操作"].map((head, index) => (
                      <th
                        key={head}
                        className={`h-10 whitespace-nowrap px-3 font-medium ${
                          index === 0
                            ? "w-[270px]"
                            : index === 1
                              ? "w-[78px]"
                              : index === 2
                                ? "w-[120px]"
                                : index === 3
                                  ? "w-[90px]"
                                  : index === 4
                                    ? "w-[95px]"
                                    : index === 5
                                      ? "w-[75px]"
                                      : index === 6 || index === 7
                                        ? "w-[105px]"
                                        : "w-[220px]"
                        }`}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {translateRecords.map((row, index) => {
                    const failed = row[6].includes("失败");
                    const checked = selectedDocIndexes.has(index);
                    const summaryStatus = failed
                      ? "none"
                      : generatingSummaryNames.has(row[0])
                        ? "generating"
                        : summaryByFileName[row[0]]
                          ? "done"
                          : "none";
                    return (
                      <tr
                        key={`${row[0]}-${index}`}
                        className={`border-b border-[#eee] text-[#333] hover:bg-[rgba(0,198,243,.04)] ${
                          checked ? "bg-[#f3fdff]" : ""
                        }`}
                      >
                        <td className="h-10 px-3">
                          <input
                            type="checkbox"
                            aria-label={`选择文件 ${row[0]}`}
                            checked={checked}
                            onChange={() => toggleDocSelection(index)}
                            className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                          />
                        </td>
                        <td className="h-10 px-3">
                          <TranslationFileNameCell
                            name={row[0]}
                            summaryStatus={summaryStatus}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[12px] ${row[1] === "内部" ? "border-[#ddd] text-[#999]" : "border-[#eee] text-[#999]"}`}>{row[1]}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 text-[#666]">{row[2]}</td>
                        <td className="whitespace-nowrap px-3">{row[3]}</td>
                        <td className="whitespace-nowrap px-3">{row[4]}</td>
                        <td className="whitespace-nowrap px-3">{row[5]}</td>
                        <td className={`whitespace-nowrap px-3 ${failed ? "text-[#f56c6c]" : ""}`}>
                          {row[6]}{failed && <span className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f56c6c] text-[10px] text-white">!</span>}
                        </td>
                        <td className={`whitespace-nowrap px-3 ${failed ? "text-[#f56c6c]" : ""}`}>{row[7]}</td>
                        <td className="whitespace-nowrap px-3">
                          <div className="flex items-center gap-4 whitespace-nowrap text-[13px]">
                            {!failed && (
                              <>
                                <button type="button" className="text-[#00b4fa] hover:underline">查看</button>
                                <button type="button" className="text-[#00b4fa] hover:underline">导出</button>
                                <button type="button" className="text-[#00b4fa] hover:underline">深度编辑</button>
                              </>
                            )}
                            <button type="button" className={failed ? "text-[#00b4fa] hover:underline" : "text-[#00b4fa] hover:underline"}>删除</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 text-[13px] text-[#999]">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#ccc]"><ChevronLeft className="h-4 w-4" /></button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`h-8 min-w-8 rounded-md border px-2 ${page === 1 ? "border-[#d5f5fd] bg-[#f3fdff] text-[#00b4fa]" : "border-[#eee] bg-white text-[#666]"}`}
                >
                  {page}
                </button>
              ))}
              <span className="px-1">...</span>
              <button type="button" className="h-8 min-w-8 rounded-md border border-[#eee] bg-white px-2 text-[#666]">11</button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#666]"><ChevronRight className="h-4 w-4" /></button>
              <button type="button" className="flex h-8 items-center gap-1 rounded-md border border-[#eee] bg-white px-3 text-[#666]">
                10 条/页
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <span>跳至</span>
              <input className="h-8 w-12 rounded-md border border-[#eee] px-2 text-center outline-none focus:border-[#8ce8fb]" />
              <span>页</span>
            </div>
          </section>
        </main>
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-[760px] max-w-[calc(100vw-220px)] flex-col border-l border-[#e8edf3] bg-white shadow-[-12px_0_28px_rgba(0,0,0,0.12)] transition-transform duration-200 ${
          qaDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!qaDrawerOpen}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#edf0f4] px-5">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-[#333]">智能问答</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="进入智能问答页面"
              title="进入智能问答页面"
              onClick={() => {
                setQaDrawerOpen(false);
                onOpenKnowledgeQa();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d5f5fd] bg-[#f3fdff] text-[#00aeda] hover:border-[#00c6f3] hover:bg-[#e8f9fe]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="关闭智能问答"
              onClick={() => setQaDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f2f3f5] hover:text-[#333]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <KnowledgeQaWorkspace
          embedded
          onOpenTranslate={() => setQaDrawerOpen(false)}
        />
      </div>
    </div>
  );
}

function KnowledgeQaWorkspace({
  onOpenTranslate,
  embedded = false,
}: {
  onOpenTranslate: () => void;
  embedded?: boolean;
}) {
  const [input, setInput] = useState("");
  const [kbOpen, setKbOpen] = useState(false);
  const [kbCount, setKbCount] = useState(1);
  const [webOn, setWebOn] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [draftMode, setDraftMode] = useState(false);
  const [sentQuestion, setSentQuestion] = useState("天坛奖怎么翻译");
  const [citationOpen, setCitationOpen] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(embedded);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = draftMode ? undefined : conversations.find((c) => c.active);
  const isNewChat = draftMode;

  const visibleConversations = useMemo(
    () =>
      conversations.filter((c) =>
        historyQuery.trim() ? c.title.toLowerCase().includes(historyQuery.trim().toLowerCase()) : true,
      ),
    [conversations, historyQuery],
  );

  if (window.location.pathname === "/document-preview") {
    return <DocumentPreviewPage />;
  }

  const handleNewChat = () => {
    setDraftMode(true);
    setConversations((prev) => prev.map((c) => ({ ...c, active: false })));
    setInput("");
    setSentQuestion("");
    setCitationOpen(false);
  };

  const handleSelectConv = (id: string) => {
    setDraftMode(false);
    setSentQuestion("天坛奖怎么翻译");
    setConversations((prev) => prev.map((c) => ({ ...c, active: c.id === id })));
  };

  const handleSend = (presetText?: string, options: { openCitation?: boolean } = {}) => {
    const text = (presetText ?? input).trim();
    if (!text) return;
    if (draftMode) {
      const id = `new-${Date.now()}`;
      const title = text.slice(0, 20);
      setConversations((prev) => [
        { id, title, group: "今天", active: true },
        ...prev.map((c) => ({ ...c, active: false })),
      ]);
      setDraftMode(false);
    }
    setSentQuestion(text);
    setCitationOpen(options.openCitation ?? true);
    setInput("");
  };

  const handleDeleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const wasActive = prev.find((c) => c.id === id)?.active;
      const next = prev.filter((c) => c.id !== id);
      if (wasActive && next.length > 0) next[0].active = true;
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = () => {
    setConversations((prev) => {
      const next = prev.filter((c) => !selectedIds.has(c.id));
      if (!next.some((c) => c.active) && next.length > 0) next[0].active = true;
      return next;
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const startRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditingTitle(c.title);
  };

  const commitRename = () => {
    if (!editingId) return;
    const title = editingTitle.trim() || "未命名";
    setConversations((prev) => prev.map((c) => (c.id === editingId ? { ...c, title } : c)));
    setEditingId(null);
  };

  const isHistoryCollapsed = embedded && historyCollapsed;

  const workspaceContent = (
    <div className="relative flex h-full w-full min-w-0 bg-[#f7f8fb] text-[#1f2329]">
      <aside
        className={`flex shrink-0 flex-col border-r border-[#eef0f3] bg-[#fafbfc] transition-[width,padding] duration-200 ${
          isHistoryCollapsed
            ? "w-12 items-center px-2 py-3"
            : embedded
              ? "w-[210px] p-3"
              : "w-[240px] p-3"
        }`}
      >
        {isHistoryCollapsed ? (
          <button
            type="button"
            aria-label="打开对话侧边栏"
            title="打开对话侧边栏"
            onClick={() => setHistoryCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e8edf3] bg-white text-[#6b7280] shadow-sm hover:border-[#8ce8fb] hover:text-[#00b4fa]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3da0ff] to-[#3478f6] py-2.5 text-white shadow-sm hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                <span>新建对话</span>
              </button>
              {embedded && (
                <button
                  type="button"
                  aria-label="收起对话侧边栏"
                  title="收起对话侧边栏"
                  onClick={() => setHistoryCollapsed(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#e8edf3] bg-white text-[#9098a4] hover:border-[#8ce8fb] hover:text-[#00b4fa]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectMode ? (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-[#eef0f3] bg-white px-2.5 py-2">
                <button
                  onClick={() => {
                    const allIds = visibleConversations.map((c) => c.id);
                    setSelectedIds(selectedIds.size === allIds.length ? new Set() : new Set(allIds));
                  }}
                  className="flex items-center gap-1.5 text-[13px] text-[#3a4150] hover:text-[#3478f6]"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      selectedIds.size === visibleConversations.length && visibleConversations.length > 0
                        ? "border-[#3478f6] bg-[#3478f6]"
                        : "border-[#cbd0d8] bg-white"
                    }`}
                  >
                    {selectedIds.size === visibleConversations.length && visibleConversations.length > 0 && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </span>
                  全选
                </button>
                <span className="flex-1" />
                <button
                  disabled={selectedIds.size === 0}
                  onClick={handleBatchDelete}
                  className="text-[13px] text-[#ef4444] hover:underline disabled:text-[#cbd0d8] disabled:no-underline"
                >
                  删除{selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </button>
                <button
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="text-[13px] text-[#6b7280] hover:text-[#3a4150]"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-transparent bg-white px-2.5 py-2 hover:border-[#eef0f3]">
                <Search className="h-3.5 w-3.5 text-[#9098a4]" />
                <input
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="搜索历史内容"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9098a4]"
                />
                <Trash2
                  onClick={() => {
                    setSelectMode(true);
                    setSelectedIds(new Set());
                  }}
                  className="h-3.5 w-3.5 cursor-pointer text-[#9098a4] hover:text-[#ef4444]"
                />
              </div>
            )}

        <div className="mt-3 flex-1 overflow-y-auto">
          {visibleConversations.length === 0 ? (
            <div className="px-2 py-6 text-center text-[12px] text-[#9098a4]">无匹配记录</div>
          ) : (
            groups.map((group) => {
              const items = visibleConversations.filter((c) => c.group === group);
              if (!items.length) return null;
              return (
                <div key={group} className="mb-3">
                  <div className="px-2 py-1 text-[12px] text-[#9098a4]">{group}</div>
                  {items.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (selectMode) toggleSelected(c.id);
                        else if (editingId !== c.id) handleSelectConv(c.id);
                      }}
                      className={`group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] ${
                        c.active && !selectMode
                          ? "bg-[#eef0ff] text-[#3478f6]"
                          : "text-[#3a4150] hover:bg-[#f1f3f6]"
                      }`}
                    >
                      {selectMode ? (
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${
                            selectedIds.has(c.id) ? "border-[#3478f6] bg-[#3478f6]" : "border-[#cbd0d8] bg-white"
                          }`}
                        >
                          {selectedIds.has(c.id) && <Check className="h-3 w-3 text-white" />}
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center">
                          <span className="block h-2 w-2 rounded-sm bg-[#60a5fa]" />
                        </span>
                      )}
                      {editingId === c.id ? (
                        <>
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="min-w-0 flex-1 rounded border border-[#3478f6] bg-white px-1 py-0.5 text-[13px] outline-none"
                          />
                          <button onClick={(e) => { e.stopPropagation(); commitRename(); }} className="rounded p-0.5 text-[#22c55e] hover:bg-white">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="rounded p-0.5 text-[#9098a4] hover:bg-white">
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate">{c.title}</span>
                          {!selectMode && (
                            <>
                              <button onClick={(e) => startRename(c, e)} className="rounded p-0.5 text-[#9098a4] opacity-0 hover:bg-white hover:text-[#3478f6] group-hover:opacity-100" title="重命名">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => handleDeleteConv(c.id, e)} className="rounded p-0.5 text-[#9098a4] opacity-0 hover:bg-white hover:text-[#ef4444] group-hover:opacity-100" title="删除">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
          </>
        )}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        {!draftMode && (
          <header className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-3">
            <div className="flex items-center gap-2">
              <button onClick={handleNewChat} className="rounded-md p-1 text-[#6b7280] hover:bg-[#f1f3f6]">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#eef0ff] text-[#3478f6]">
                <BookOpen className="h-3 w-3" />
              </span>
              <span className="text-[14px]">{activeConv?.title ?? "知识库问答"}</span>
              <span className="text-[12px] text-[#c0c6d0]">企业知识库问答</span>
            </div>
            <button onClick={handleNewChat} className="flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#3478f6]">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>重新开始</span>
            </button>
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {isNewChat ? (
            <div className="mx-auto flex h-full max-w-[820px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7c8cff] to-[#5b6cf5] text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-[16px] text-[#1f2329]">开启新的对话</div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-[820px] flex-col gap-6">
              <div className="flex justify-end">
                <div className="rounded-2xl bg-[#f3f4f7] px-4 py-2.5 text-[14px]">
                  {sentQuestion || "天坛奖怎么翻译"}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c8cff] to-[#5b6cf5] text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setCitationOpen(true)}
                    className="mb-4 flex w-full items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-left text-[13px] text-[#3a4150] hover:bg-[#f1f5f9]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3478f6]" />
                      回答完成，基于已有信息匹配到 {hitDocuments.length} 个内容：
                    </span>
                    <span className="text-[#9098a4]">⌄</span>
                  </button>

                  <div className="space-y-3 text-[14px] leading-7 text-[#1f2329]">
                    <p>
                      “天坛奖”在英文中通常翻译为 <strong>"Tiantan Award"</strong>，其中 <em>Tian Tan</em> 指北京著名地标天坛，Award 表示奖项。
                      <SourceMarker count={hitDocuments.length} onClick={() => setCitationOpen(true)} />
                    </p>
                    <p>
                      如果是正式电影节语境，建议保留专名拼音并使用首字母大写；首次出现时可补充说明为 Beijing International Film Festival 的竞赛奖项。
                      <SourceMarker count={1} onClick={() => setCitationOpen(true)} />
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-[#9098a4]">
                    <button className="rounded p-1 hover:bg-[#f1f3f6] hover:text-[#3478f6]" title="复制">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded p-1 hover:bg-[#f1f3f6] hover:text-[#ef4444]" title="没帮助">
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`${embedded ? "px-4" : "px-6"} pb-6`}>
          <div className="mx-auto max-w-[820px] rounded-2xl border border-[#e5e7ec] bg-white p-3 shadow-[0_2px_12px_rgba(20,20,43,0.04)]">
            <div className="mb-2 flex flex-wrap gap-2 border-b border-[#f1f3f6] pb-2">
              {quickQuestionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.question}
                    aria-label={item.label}
                    onClick={() => {
                      if (item.sendImmediately) {
                        handleSend(item.question, { openCitation: item.openCitation });
                        return;
                      }
                      setInput(item.question);
                    }}
                    className="group inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e5e7ec] bg-white px-2.5 text-[12px] text-[#3a4150] hover:border-[#d5dbe5] hover:bg-[#f9fafc] hover:text-[#00aeda]"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#b8c0cc] group-hover:text-[#8a94a6]" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2 border-b border-[#f1f3f6] pb-2">
                {attachedFiles.map((file) => (
                  <span
                    key={file.id}
                    className="group inline-flex max-w-[260px] items-center gap-1.5 rounded-md border border-[#e5e7ec] bg-[#f8fafc] px-2 py-1 text-[12px] text-[#3a4150]"
                    title={file.name}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" />
                    <span className="min-w-0 truncate">{file.name}</span>
                    {file.level && (
                      <span className="shrink-0 rounded border border-[#a7f3d0] bg-[#ecfdf5] px-1 text-[11px] text-[#10b981]">
                        {file.level}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachedFiles((prev) =>
                          prev.filter((f) => f.id !== file.id),
                        )
                      }
                      className="rounded p-0.5 text-[#9098a4] hover:bg-white hover:text-[#ef4444]"
                      title="移除"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 5000))}
              placeholder="在这里向我提问"
              rows={2}
              className="w-full resize-none bg-transparent px-2 py-1 text-[14px] outline-none placeholder:text-[#9098a4]"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const list = e.target.files;
                    if (!list || list.length === 0) return;
                    setPendingFiles(Array.from(list));
                    setAttachmentOpen(true);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 rounded-md p-1.5 text-[#6b7280] hover:bg-[#f1f3f6]"
                  title="上传附件"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setKbOpen(true)}
                  className={`flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-[12px] ${
                    kbCount > 0
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#2563eb]"
                      : "border-[#e5e7ec] text-[#3a4150] hover:border-[#3478f6] hover:text-[#3478f6]"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  知识库
                  {kbCount > 0 && (
                    <span className="ml-0.5 inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#3478f6] px-1 text-[11px] text-white">
                      {kbCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setWebOn((v) => !v)}
                  className={`flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-[12px] ${
                    webOn
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#2563eb]"
                      : "border-[#e5e7ec] text-[#3a4150] hover:border-[#3478f6] hover:text-[#3478f6]"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  互联网
                </button>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <span className="text-[12px] text-[#9098a4]">{input.length}/5000</span>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5e7ec] text-white disabled:opacity-60 enabled:bg-gradient-to-br enabled:from-[#7c6cff] enabled:to-[#6b59f5]"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CitationPanel open={citationOpen} onClose={() => setCitationOpen(false)} documents={hitDocuments} />

      <KnowledgeBaseModal
        open={kbOpen}
        onClose={() => setKbOpen(false)}
        onConfirm={(count) => setKbCount(count)}
        embedded={embedded}
      />

      <AttachmentUploadModal
        open={attachmentOpen}
        initialFiles={pendingFiles}
        embedded={embedded}
        onClose={() => {
          setAttachmentOpen(false);
          setPendingFiles([]);
        }}
        onConfirm={(files) => {
          setAttachedFiles((prev) => [...prev, ...files]);
          setAttachmentOpen(false);
          setPendingFiles([]);
        }}
      />
    </div>
  );

  if (embedded) return workspaceContent;

  return (
    <EnterpriseShell onOpenTranslate={onOpenTranslate}>
      {workspaceContent}
    </EnterpriseShell>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState<"translate" | "qa">("translate");

  if (window.location.pathname === "/document-preview") {
    return <DocumentPreviewPage />;
  }

  if (workspace === "qa") {
    return <KnowledgeQaWorkspace onOpenTranslate={() => setWorkspace("translate")} />;
  }

  return <DocumentFastTranslatePage onOpenKnowledgeQa={() => setWorkspace("qa")} />;
}
