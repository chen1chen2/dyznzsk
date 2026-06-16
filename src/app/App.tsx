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
  onOpenProject,
}: {
  children: React.ReactNode;
  onOpenTranslate: () => void;
  onOpenProject: () => void;
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
                onClick={onOpenProject}
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

const projectRecords = [
  {
    name: "售前资料多语翻译项目",
    code: "P20260616001",
    category: "翻译项目",
    type: "文档翻译",
    manuscript: "售前模板.docx",
    customer: "传神多语",
    language: "中 - 英",
    industry: "信息技术",
    manager: "陈晨",
    progress: "68%",
    status: "进行中",
    createdAt: "2026.06.16 09:20",
  },
  {
    name: "BIOS 技术资料本地化",
    code: "P20260615008",
    category: "本地化项目",
    type: "技术资料",
    manuscript: "BIOS0629-109_中文原文.docx",
    customer: "硬件事业部",
    language: "中 - 英",
    industry: "智能制造",
    manager: "李明",
    progress: "100%",
    status: "已完成",
    createdAt: "2026.06.15 15:55",
  },
  {
    name: "制剂质量控制文档翻译",
    code: "P20260615004",
    category: "翻译项目",
    type: "质量体系",
    manuscript: "制剂的质量控制1234.docx",
    customer: "医药客户组",
    language: "中 - 英",
    industry: "生物医药",
    manager: "王敏",
    progress: "42%",
    status: "进行中",
    createdAt: "2026.06.15 13:40",
  },
  {
    name: "船舶月刊日中翻译",
    code: "P20260611011",
    category: "翻译项目",
    type: "期刊资料",
    manuscript: "世界の船舶2026年5月号.pdf",
    customer: "海事资料中心",
    language: "日 - 中",
    industry: "船舶海工",
    manager: "赵蕾",
    progress: "15%",
    status: "逾期",
    createdAt: "2026.06.11 18:17",
  },
  {
    name: "洗碗机说明书翻译",
    code: "P20260604003",
    category: "本地化项目",
    type: "产品说明书",
    manuscript: "01 洗碗机说明书_扫描版-1.pdf",
    customer: "家电产品组",
    language: "中 - 英",
    industry: "家用电器",
    manager: "周扬",
    progress: "86%",
    status: "进行中",
    createdAt: "2026.06.04 20:56",
  },
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
  "模块_子模块_陈探_V1.x.docx": {
    overview:
      "该文件为项目主稿件，包含模块与子模块相关说明、版本信息和待翻译内容，可用于快速了解项目交付范围与术语重点。",
    points: ["模块说明", "子模块配置", "版本信息", "项目主稿件"],
  },
  "(2)CPET管理手册.docx": {
    overview:
      "该任务稿件围绕 CPET 管理流程、任务处理规则和项目交付要求展开，适合作为任务翻译阶段的上下文参考。",
    points: ["CPET 管理", "任务处理", "项目交付", "翻译流程"],
  },
  "(3)CPET管理手册.docx": {
    overview:
      "该任务稿件包含 CPET 管理手册的连续章节，重点涉及操作规范、审核节点和状态跟踪说明。",
    points: ["操作规范", "审核节点", "状态跟踪", "管理手册"],
  },
  "(4)CPET管理手册.docx": {
    overview:
      "该稿件为 CPET 管理手册拆分任务，包含流程配置、派发说明和任务截止要求。",
    points: ["流程配置", "任务派发", "截止日期", "拆分稿件"],
  },
  "(1)CPET管理手册.docx": {
    overview:
      "该稿件为 CPET 管理手册起始章节，包含项目背景、基础术语和翻译执行说明。",
    points: ["项目背景", "基础术语", "执行说明", "起始章节"],
  },
  "(5)CPET管理手册.docx": {
    overview:
      "该稿件为 CPET 管理手册后续章节，包含审核任务、完成状态和交付检查相关内容。",
    points: ["审核任务", "完成状态", "交付检查", "后续章节"],
  },
};

const projectTaskRecords = [
  {
    name: "(2)CPET管理手册.docx",
    id: "634710262849875972",
    level: "30",
    words: "2,393字",
    locked: "已锁定",
    total: "3,684",
    progress: 0,
    flow: "翻译",
    status: "待处理",
    statusTone: "pending",
    assignedAt: "2026-06-09 11:12",
    dueAt: "2026-06-26 11:13",
  },
  {
    name: "(3)CPET管理手册.docx",
    id: "634710262849875975",
    level: "30",
    words: "2,454字",
    locked: "已锁定",
    total: "4,856",
    progress: 0,
    flow: "翻译",
    status: "待处理",
    statusTone: "pending",
    assignedAt: "2026-06-09 11:12",
    dueAt: "2026-06-26 11:13",
  },
  {
    name: "(4)CPET管理手册.docx",
    id: "634710262849875978",
    level: "30",
    words: "3,193字",
    locked: "已锁定",
    total: "3,298",
    progress: 0,
    flow: "翻译",
    status: "待处理",
    statusTone: "pending",
    assignedAt: "2026-06-09 11:12",
    dueAt: "2026-06-26 11:13",
  },
  {
    name: "(1)CPET管理手册.docx",
    id: "634710262849875969",
    level: "30",
    words: "1,694字",
    locked: "已锁定",
    total: "3,098",
    progress: 1,
    flow: "翻译",
    status: "进行中",
    statusTone: "running",
    assignedAt: "2026-06-09 11:12",
    dueAt: "2026-06-26 11:13",
  },
  {
    name: "(5)CPET管理手册.docx",
    id: "634710262849875982",
    level: "30",
    words: "2,593字",
    locked: "无锁定",
    total: "",
    progress: 100,
    flow: "审核",
    status: "进行中",
    statusTone: "running",
    assignedAt: "2026-06-09 11:31",
    dueAt: "2026-06-27 11:31",
  },
  {
    name: "(5)CPET管理手册.docx",
    id: "634710262849875981",
    level: "30",
    words: "2,406字",
    locked: "已锁定",
    total: "2,593",
    progress: 100,
    flow: "翻译",
    status: "已完成",
    statusTone: "done",
    assignedAt: "2026-06-09 11:12",
    dueAt: "2026-06-26 11:13",
  },
];

function SidebarItem({
  active,
  children,
  icon: Icon,
  expanded,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  expanded?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

function KnowledgeQaSideDrawer({
  open,
  onClose,
  onOpenKnowledgeQa,
}: {
  open: boolean;
  onClose: () => void;
  onOpenKnowledgeQa: () => void;
}) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 flex w-[760px] max-w-[calc(100vw-220px)] flex-col border-l border-[#e8edf3] bg-white shadow-[-12px_0_28px_rgba(0,0,0,0.12)] transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
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
              onClose();
              onOpenKnowledgeQa();
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d5f5fd] bg-[#f3fdff] text-[#00aeda] hover:border-[#00c6f3] hover:bg-[#e8f9fe]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="关闭智能问答"
            title="关闭智能问答"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f2f3f5] hover:text-[#333]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <KnowledgeQaWorkspace embedded onOpenTranslate={onClose} />
    </div>
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
  const canShowHoverCard = summaryStatus === "generating" || canPreview;
  const summaryLoadingText = "智能解析中...";
  const summaryLoadingTooltip = "概要与知识点生成中...";
  const outlineSummaryIcon = (loading = false, tooltip?: string) => (
    <span
      className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded-md border border-[#00befa] bg-white px-1.5 text-[11px] font-semibold leading-none text-[#00aeda] ${
        loading ? "animate-pulse shadow-[0_0_0_2px_rgba(0,190,250,0.12)]" : ""
      }`}
      title={tooltip}
    >
      {loading ? summaryLoadingText : "概述"}
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
          title={summaryLoadingTooltip}
          aria-label={summaryLoadingTooltip}
        >
          {outlineSummaryIcon(true, summaryLoadingTooltip)}
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
      {canShowHoverCard && (
        <div className="pointer-events-none absolute left-0 top-full z-[80] mt-1 hidden w-[380px] rounded-lg border border-[#e5e7ec] bg-white p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:block">
          <div className="mb-2 whitespace-normal break-all text-[13px] font-medium leading-5 text-[#333]">
            {name}
          </div>
          {summaryStatus === "generating" ? (
            <div className="rounded-md bg-[#f3fdff] px-2 py-1.5 text-[12px] leading-5 text-[#00aeda]">
              {summaryLoadingTooltip}
            </div>
          ) : summary ? (
            <>
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
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DocumentFastTranslatePage({
  onOpenKnowledgeQa,
  onOpenProject,
}: {
  onOpenKnowledgeQa: () => void;
  onOpenProject: () => void;
}) {
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
              <SidebarItem icon={FolderKanban} expanded onClick={onOpenProject}>项目管理</SidebarItem>
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

            <div className="overflow-visible rounded-sm">
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

      <KnowledgeQaSideDrawer
        open={qaDrawerOpen}
        onClose={() => setQaDrawerOpen(false)}
        onOpenKnowledgeQa={onOpenKnowledgeQa}
      />
    </div>
  );
}

function ProjectManagementPage({
  onOpenTranslate,
  onOpenKnowledgeQa,
  onOpenWebcat,
}: {
  onOpenTranslate: () => void;
  onOpenKnowledgeQa: () => void;
  onOpenWebcat: () => void;
}) {
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileSelected, setFileSelected] = useState(true);
  const [activeProjectTab, setActiveProjectTab] = useState<"files" | "tasks">("files");
  const [selectedTaskIndexes, setSelectedTaskIndexes] = useState<Set<number>>(() => new Set([0, 1]));
  const [projectSummaryLoading, setProjectSummaryLoading] = useState(true);
  const tabItems = ["文件(1)", "任务", "成员(1)", "动态", "进度", "统计", "设置"];
  const projectFileName = "模块_子模块_陈探_V1.x.docx";
  const selectedTaskCount = selectedTaskIndexes.size;
  const selectedTaskWords = projectTaskRecords
    .filter((_, index) => selectedTaskIndexes.has(index))
    .reduce((sum, task) => sum + Number(task.words.replace(/[^\d]/g, "")), 0);
  const allTasksSelected = selectedTaskIndexes.size === projectTaskRecords.length;

  useEffect(() => {
    const timer = window.setTimeout(() => setProjectSummaryLoading(false), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTaskSelection = (index: number) => {
    setSelectedTaskIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAllTasks = () => {
    setSelectedTaskIndexes((prev) =>
      prev.size === projectTaskRecords.length
        ? new Set()
        : new Set(projectTaskRecords.map((_, index) => index)),
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
              <SidebarItem icon={Files} onClick={onOpenTranslate}>文档快翻</SidebarItem>
              <SidebarItem icon={FolderKanban} expanded active>项目管理</SidebarItem>
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

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f0f2f5] px-5 py-4">
          <div className="mb-3 flex h-6 items-center gap-2 text-[13px] leading-5 text-[#999]">
            <span>项目管理</span>
            <span>/</span>
            <span className="font-medium text-[#666]">项目详情</span>
          </div>

          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_150px] gap-4">
            <section className="rounded-lg bg-white px-5 py-3 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-[#6ecbff]" />
                <h1 className="max-w-[520px] truncate text-[16px] font-medium leading-6 text-[#333]">
                  模块_子模块_陈探_V1.x-06161319
                </h1>
                {["简体中文 - 英语", "通用行业", "机器"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-5 items-center rounded-full border border-[#e5e7ec] bg-[#fafbfc] px-2 text-[12px] leading-[18px] text-[#666]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-[13px] leading-5 text-[#888]">
                <span>在线笔译总字数：</span>
                <strong className="text-[#333]">152</strong>
                <span>（中朝字数）</span>
                <button
                  type="button"
                  className="inline-flex h-6 items-center rounded-full border border-[rgba(0,198,243,.35)] bg-[#f3fdff] px-3 text-[12px] leading-[18px] text-[#00aeda] hover:border-[#00c6f3]"
                >
                  添加历史语料库，可重复率分析
                  <span className="ml-1 text-[#00befa]">节省成本</span>
                  <span className="ml-1 text-[#00aeda]">前往</span>
                </button>
                <button type="button" className="ml-auto inline-flex items-center text-[12px] text-[#888] hover:text-[#00b4fa]">
                  展开
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            <section className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
              <div>
                <div className="text-[12px] text-[#999]">项目总进度：</div>
                <div className="mt-1 text-[18px] font-semibold leading-6 text-[#333]">0%</div>
                <div className="mt-1 text-[12px] text-[#aaa]">创建人： 管理员</div>
              </div>
              <div className="relative h-12 w-12 rounded-full bg-[#dff7ff]">
                <div className="absolute inset-3 rounded-full bg-white" />
                <div className="absolute inset-0 rounded-full border-[8px] border-[#bcefff]" />
              </div>
            </section>
          </div>

          <section className="rounded-lg bg-white p-4 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
            <div className="mb-4 flex h-10 items-end gap-0 border-b border-[#edf0f4]">
              {tabItems.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    if (index === 0) setActiveProjectTab("files");
                    if (index === 1) setActiveProjectTab("tasks");
                  }}
                  className={`h-10 min-w-[72px] rounded-t-md border border-b-0 border-[#edf0f4] px-5 text-[14px] leading-5 ${
                    (index === 0 && activeProjectTab === "files") ||
                    (index === 1 && activeProjectTab === "tasks")
                      ? "bg-white font-semibold text-[#00aeda]"
                      : "bg-[#f7f8fa] text-[#666] hover:text-[#00b4fa]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeProjectTab === "files" ? (
              <>
            <div className="mb-3 flex h-8 items-center gap-2">
              <button type="button" className="h-8 rounded-md bg-[#00befa] px-4 text-[13px] leading-5 text-white hover:bg-[#00b4fa]">
                上传文件
              </button>
              <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                重复率分析
              </button>
              <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                项目级审核
              </button>
              <button type="button" aria-label="更多操作" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                ...
              </button>
              <button type="button" className="ml-auto h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                快捷引导
              </button>
            </div>

            <div className="mb-3 flex min-h-8 items-center gap-2">
              <div className="flex h-8 items-center rounded-sm bg-[#eefaff] px-3 text-[13px] leading-5 text-[#999]">
                已选 1 项　共计：152 字数
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">全部单双语稿件 <ChevronDown className="ml-1 inline h-3.5 w-3.5" /></button>
                <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">显示原稿+拆分稿 <ChevronDown className="ml-1 inline h-3.5 w-3.5" /></button>
                <input className="h-8 w-[180px] rounded-md border border-[#e5e7ec] px-3 text-[13px] leading-5 outline-none placeholder:text-[#c7cbd2] focus:border-[#8ce8fb]" placeholder="搜索文件名或用户名" />
                <button type="button" className="h-8 rounded-md bg-[#00befa] px-4 text-[13px] leading-5 text-white hover:bg-[#00b4fa]">查询</button>
                <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">重置</button>
              </div>
            </div>

            <div className="mb-2 flex min-h-7 items-center justify-end gap-3 border-t border-[#f1f2f4] pt-2 text-[12px] leading-[18px] text-[#00aeda]">
              <button
                type="button"
                onClick={() => setQaDrawerOpen(true)}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                智能问答
              </button>
              {["解锁", "开放/暂停", "术语提取", "指派", "驳回", "结束任务", "取消/恢复", "查看", "导出", "删除"].map((action) => (
                <button key={action} type="button" className="hover:underline">
                  {action}
                </button>
              ))}
            </div>

            <div className="overflow-visible rounded-sm border border-[#f1f2f4]">
              <table className="w-full table-fixed border-collapse text-[14px] leading-5">
                <thead className="bg-[#f9fafc] text-left text-[#666]">
                  <tr>
                    <th className="h-10 w-[50px] px-3 font-medium">
                      <input
                        type="checkbox"
                        aria-label="全选项目文件"
                        checked={fileSelected}
                        onChange={(event) => setFileSelected(event.target.checked)}
                        className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                      />
                    </th>
                    <th className="h-10 px-3 font-medium">文件名称 <ChevronDown className="ml-1 inline h-3 w-3 text-[#999]" /></th>
                    <th className="h-10 w-[120px] px-3 font-medium">中朝字数</th>
                    <th className="h-10 w-[72px] px-3 font-medium">预翻</th>
                    <th className="h-10 w-[72px] px-3 font-medium">翻译</th>
                    <th className="h-10 w-[72px] px-3 font-medium">审核</th>
                    <th className="h-10 w-[150px] px-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#eee] hover:bg-[rgba(0,198,243,.04)]">
                    <td className="h-12 px-3">
                      <input
                        type="checkbox"
                        aria-label={`选择文件 ${projectFileName}`}
                        checked={fileSelected}
                        onChange={(event) => setFileSelected(event.target.checked)}
                        className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                      />
                    </td>
                    <td className="px-3">
                      <TranslationFileNameCell
                        name={projectFileName}
                        summaryStatus={projectSummaryLoading ? "generating" : "done"}
                      />
                      <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[#999]">
                        <span>单语</span>
                        <span>|</span>
                        <span>06-16</span>
                        <span className="rounded-full border border-[#e5e7ec] px-1.5 text-[#999]">公开</span>
                      </div>
                    </td>
                    <td className="px-3 text-[#666]">152 字 <span className="text-[#bbb]">（无锁定）</span></td>
                    {["预翻", "翻译", "审核"].map((step, index) => (
                      <td key={step} className="px-3">
                        <div className="flex items-center gap-1 text-[#999]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f9fe] text-[#00aeda]">
                            {index === 0 ? "▶" : "+"}
                          </span>
                          <span className="text-[12px]">{step}</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-3 text-right">
                      <button type="button" onClick={onOpenWebcat} className="mr-3 text-[13px] text-[#00aeda] hover:underline">查看</button>
                      <button type="button" className="mr-3 text-[13px] text-[#00aeda] hover:underline">导出</button>
                      <button type="button" aria-label="更多文件操作" className="text-[13px] text-[#00aeda] hover:underline">...</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 text-[13px] leading-5 text-[#999]">
              <span>总共 1 个主文件</span>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#ccc]"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" className="h-8 min-w-8 rounded-md border border-[#00befa] bg-white px-2 text-[#00aeda]">1</button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#ccc]"><ChevronRight className="h-4 w-4" /></button>
              <button type="button" className="flex h-8 items-center gap-1 rounded-md border border-[#eee] bg-white px-3 text-[#666]">
                10 条/页
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex h-8 items-center gap-2">
                  <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                    导出记录
                  </button>
                  <button type="button" className="h-8 rounded-md bg-[#f7f8fa] px-3 text-[13px] leading-5 text-[#666]">
                    待处理 <span className="ml-1 text-[#00aeda]">3</span>
                  </button>
                  <button type="button" className="h-8 rounded-md bg-[#f7f8fa] px-3 text-[13px] leading-5 text-[#666]">
                    进行中 <span className="ml-1 text-[#00aeda]">2</span>
                  </button>
                  <button type="button" className="h-8 rounded-md bg-[#f7f8fa] px-3 text-[13px] leading-5 text-[#666]">
                    待开始 <span className="ml-1 text-[#00aeda]">0</span>
                  </button>
                  <button type="button" className="h-8 rounded-md bg-[#f7f8fa] px-3 text-[13px] leading-5 text-[#666]">
                    驳回 <span className="ml-1 text-[#00aeda]">0</span>
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                      项目流程
                      <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
                      任务状态
                      <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
                    </button>
                    <input
                      className="h-8 w-[180px] rounded-md border border-[#e5e7ec] px-3 text-[13px] leading-5 outline-none placeholder:text-[#c7cbd2] focus:border-[#8ce8fb]"
                      placeholder="请输入文件名"
                    />
                    <button type="button" className="h-8 rounded-md bg-[#00befa] px-4 text-[13px] leading-5 text-white hover:bg-[#00b4fa]">查询</button>
                    <button type="button" className="h-8 rounded-md border border-[#e5e7ec] bg-white px-4 text-[13px] leading-5 text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">重置</button>
                  </div>
                </div>

                <div className="mb-3 flex min-h-8 items-center gap-2">
                  <div className="flex h-8 items-center rounded-sm bg-[#eefaff] px-3 text-[13px] leading-5 text-[#999]">
                    已选 {selectedTaskCount} 项
                    {selectedTaskCount > 0 && (
                      <span className="ml-3">共计：{selectedTaskWords.toLocaleString()} 字数</span>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-[12px] leading-[18px] text-[#00aeda]">
                    <button
                      type="button"
                      disabled={selectedTaskCount === 0}
                      onClick={() => setQaDrawerOpen(true)}
                      className="inline-flex items-center gap-1 hover:underline disabled:cursor-not-allowed disabled:text-[#bfbfbf] disabled:no-underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      智能问答
                    </button>
                    {["批量翻译", "驳回", "导出"].map((action) => (
                      <button key={action} type="button" className="hover:underline">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-visible rounded-sm border border-[#f1f2f4]">
                  <table className="w-full min-w-[1180px] table-fixed border-collapse text-[14px] leading-5">
                    <thead className="bg-[#f9fafc] text-left text-[#666]">
                      <tr>
                        <th className="h-10 w-[50px] px-3 font-medium">
                          <input
                            type="checkbox"
                            aria-label="全选任务稿件"
                            checked={allTasksSelected}
                            onChange={toggleAllTasks}
                            className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                          />
                        </th>
                        <th className="h-10 w-[260px] px-3 font-medium">文件名</th>
                        <th className="h-10 w-[90px] px-3 font-medium">涉密等级</th>
                        <th className="h-10 w-[145px] px-3 font-medium">中朝字数</th>
                        <th className="h-10 w-[120px] px-3 font-medium">任务进度</th>
                        <th className="h-10 w-[100px] px-3 font-medium">项目流程</th>
                        <th className="h-10 w-[100px] px-3 font-medium">任务状态</th>
                        <th className="h-10 w-[145px] px-3 font-medium">派发时间</th>
                        <th className="h-10 w-[145px] px-3 font-medium">截止日期</th>
                        <th className="h-10 w-[160px] px-3 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTaskRecords.map((task, index) => {
                        const checked = selectedTaskIndexes.has(index);
                        const isDone = task.statusTone === "done";
                        const summaryStatus =
                          projectSummaryLoading && index === 0 ? "generating" : "done";
                        return (
                          <tr
                            key={`${task.name}-${task.id}`}
                            className={`border-b border-[#eee] hover:bg-[rgba(0,198,243,.04)] ${
                              checked ? "bg-[#f3fdff]" : ""
                            }`}
                          >
                            <td className="h-12 px-3">
                              <input
                                type="checkbox"
                                aria-label={`选择任务稿件 ${task.name}`}
                                checked={checked}
                                onChange={() => toggleTaskSelection(index)}
                                className="h-4 w-4 rounded border-[#d9dee8] accent-[#00befa]"
                              />
                            </td>
                            <td className="px-3">
                              <TranslationFileNameCell
                                name={task.name}
                                summaryStatus={summaryStatus}
                              />
                              <div className="mt-0.5 truncate text-[12px] text-[#c4c8d0]">
                                {task.id}
                              </div>
                            </td>
                            <td className="px-3">
                              <span className="inline-flex h-5 items-center rounded-full border border-[#e5e7ec] px-2 text-[12px] text-[#999]">
                                {task.level}
                              </span>
                            </td>
                            <td className="px-3 text-[#666]">
                              {task.words}
                              <span className="ml-1 text-[#c4c8d0]">
                                （{task.locked}{task.total ? ` / ${task.total}` : ""}）
                              </span>
                            </td>
                            <td className="px-3">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-[64px] overflow-hidden rounded-full bg-[#eef0f3]">
                                  <span
                                    className={`block h-full rounded-full ${isDone ? "bg-[#52c41a]" : "bg-[#00befa]"}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </span>
                                <span className={`text-[12px] ${isDone ? "text-[#52c41a]" : "text-[#999]"}`}>
                                  {task.progress}%
                                </span>
                                {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-[#52c41a]" />}
                              </div>
                            </td>
                            <td className="px-3 text-[#333]">{task.flow}</td>
                            <td className="px-3">
                              <span className="inline-flex items-center gap-1 text-[#333]">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    task.statusTone === "done"
                                      ? "bg-[#52c41a]"
                                      : task.statusTone === "running"
                                        ? "bg-[#00c6f3]"
                                        : "bg-[#00c6f3]"
                                  }`}
                                />
                                {task.status}
                              </span>
                            </td>
                            <td className="px-3 text-[#666]">{task.assignedAt}</td>
                            <td className="px-3 text-[#666]">{task.dueAt}</td>
                            <td className="px-3 text-right">
                              <button type="button" onClick={onOpenWebcat} className="mr-3 text-[13px] text-[#00aeda] hover:underline">
                                {isDone ? "预览" : "在线笔译"}
                              </button>
                              <button type="button" className="mr-3 text-[13px] text-[#00aeda] hover:underline">导出</button>
                              <button type="button" aria-label="更多任务操作" className="text-[13px] text-[#00aeda] hover:underline">...</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 text-[13px] leading-5 text-[#999]">
                  <span>共6条</span>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#ccc]"><ChevronLeft className="h-4 w-4" /></button>
                  <button type="button" className="h-8 min-w-8 rounded-md border border-[#00befa] bg-white px-2 text-[#00aeda]">1</button>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded text-[#ccc]"><ChevronRight className="h-4 w-4" /></button>
                  <button type="button" className="flex h-8 items-center gap-1 rounded-md border border-[#eee] bg-white px-3 text-[#666]">
                    10 条/页
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <KnowledgeQaSideDrawer
        open={qaDrawerOpen}
        onClose={() => setQaDrawerOpen(false)}
        onOpenKnowledgeQa={onOpenKnowledgeQa}
      />
    </div>
  );
}
function KnowledgeQaWorkspace({
  onOpenTranslate,
  onOpenProject,
  embedded = false,
}: {
  onOpenTranslate: () => void;
  onOpenProject?: () => void;
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
    <EnterpriseShell onOpenTranslate={onOpenTranslate} onOpenProject={onOpenProject ?? onOpenTranslate}>
      {workspaceContent}
    </EnterpriseShell>
  );
}

const webcatSegments = [
  {
    no: 148,
    source: "3）与公司的其他政策和目标同等重要，由各级最高管理者签发，且可公开获取。",
    target:
      "3)It shall be equally important as other company policies and objectives, issued by top management at all levels, and publicly accessible.",
    status: "100%",
    origin: "",
    active: true,
  },
  {
    no: 149,
    source: "4）与其活动、产品和服务及其对HSE的影响相关。",
    target: "4)It shall be relevant to its activities, products, services, and their impact on HSE.",
    status: "100%",
    origin: "",
  },
  {
    no: 150,
    source: "5）公司政策在所有机构和层级得到实施和维护。",
    target: "5)The company's policies are implemented and maintained at all organizational levels and hierarchies.",
    status: "MT",
    origin: "mt",
  },
  {
    no: 151,
    source: "6）承诺满足并力争超越所有适用的法律法规要求；在无适用法律法规的情况下，严格执行公司内部标准。",
    target:
      "6)Commitment to meet and strive to exceed all applicable legal and regulatory requirements; in the absence of applicable laws and regulations, strictly enforce internal company standards.",
    status: "MT",
    origin: "mt",
  },
  {
    no: 152,
    source: "7）承诺公司将其活动、产品和服务对健康、安全和环境带来的风险与危害降低至合理可行的最低水平。",
    target:
      "7)Commit to reducing the risks and hazards posed by the company's activities, products, and services to health, safety, and the environment to the lowest reasonably achievable level.",
    status: "100%",
    origin: "",
  },
  {
    no: 153,
    source: "8）设定具有挑战性的HSE目标，将领导承诺纳入HSE目标，并致力于通过系统化的管理和不懈的努力，实现HSE绩效的持续提升。",
    target:
      "8)Set challenging HSE objectives, incorporate leadership commitment into HSE goals, and strive for continuous improvement in HSE performance through systematic management and relentless efforts.",
    status: "MT",
    origin: "mt",
  },
  { no: 154, source: "相关文件", target: "related documents", status: "100%", origin: "" },
  {
    no: 155,
    source: "公司的HSE政策详见第一级文件《政策》",
    target: "The company's HSE policy is detailed in the first-level document Policy.",
    status: "100%",
    origin: "",
  },
  { no: 156, source: "5.2.2 战略目标", target: "5.2.2 strategic objective", status: "MT", origin: "mt" },
  { no: 157, source: "目的", target: "Purpose", status: "REP", origin: "rep" },
  { no: 158, source: "建立公司HSE目标并定期审查。", target: "Establish the company's HSE objectives and conduct regular reviews.", status: "MT", origin: "mt" },
  { no: 159, source: "要求", target: "Requirements", status: "100%", origin: "" },
  {
    no: 160,
    source: "1）本要素的归口管理部门为HSE部门。",
    target: "1)The functional management department for this element is the HSE Department.",
    status: "100%",
    origin: "",
  },
  {
    no: 161,
    source: "2）公司HSE目标应与公司政策保持一致，且要反映出与活动相关的HSE危害和影响，以及生产、经营、业务方面的要求。",
    target:
      "2)The company's HSE objectives shall be consistent with the company's policies and reflect the HSE hazards and impacts related to activities, as well as the requirements of production, operation, and business.",
    status: "MT",
    origin: "mt",
  },
  {
    no: 162,
    source: "3）公司HSE目标为：追求零伤害、零污染、零事故，在健康、安全与环境管理方面达到国际同行业先进水平。",
    target:
      "3)The company's HSE objectives are: to pursue zero injuries, zero pollution, and zero accidents, and to achieve internationally advanced levels in health, safety, and environmental management within the same industry.",
    status: "100%",
    origin: "",
  },
  { no: 163, source: "5.3 组织机构、资源和文件", target: "5.3 Organizational structure, resources and documentation", status: "MT", origin: "mt" },
  { no: 164, source: "5.3.1 组织机构和职责", target: "5.3.1 Organization and responsibilities", status: "100%", origin: "" },
  { no: 165, source: "目的", target: "Purpose", status: "REP", origin: "rep" },
  {
    no: 166,
    source: "明确各级组织机构的HSE职责与权限，并形成文件，推动全员履行HSE职责。",
    target:
      "Clarify the HSE responsibilities and authorities of organizational structures at all levels, document them, and promote the fulfillment of HSE duties by all personnel.",
    status: "MT",
    origin: "mt",
  },
  { no: 167, source: "要求", target: "Requirements", status: "100%", origin: "" },
  {
    no: 168,
    source: "1）本要素的归口管理部门为人力资源部门。",
    target: "1)The functional management department for this element is the Human Resources Department.",
    status: "100%",
    origin: "",
  },
  {
    no: 169,
    source: "2）建立完善的HSE组织机构，明确HSE职责，并进行沟通，推动全员落实HSE职责。",
    target:
      "2)Establish a comprehensive HSE organizational structure, clarify HSE responsibilities, and communicate them to promote the implementation of HSE duties by all personnel.",
    status: "MT",
    origin: "mt",
  },
  {
    no: 170,
    source: "公司及海外项目设立HSE委员会，作为HSE管理的最高决策机构，及时对HSE重大事务进行审议、决策，推动HSE管理持续改进。",
    target:
      "The company and overseas projects shall establish an HSE Committee as the highest decision-making body for HSE management, promptly deliberating and making decisions on major HSE matters to drive continuous improvement in HSE management.",
    status: "100%",
    origin: "",
  },
];

type WebCatAssistantTab = "提示" | "QA检查" | "备注" | "智能问答" | "日志";

const webcatAssistantTabs: WebCatAssistantTab[] = ["提示", "QA检查", "备注", "智能问答", "日志"];

function WebCatPage({ onBackProject }: { onBackProject: () => void }) {
  const [activeAssistantTab, setActiveAssistantTab] = useState<WebCatAssistantTab>("日志");
  const toolbarGroups = [
    ["确认", "机器", "质检", "润色", "清空"],
    ["撤销", "B", "I", "U", "X²", "X₂", "Aa"],
    ["清除样式", "替换", "添加术语"],
    ["差异对比", "复制原文", "合并"],
    ["批注锁定", "快照", "设置"],
  ];

  const openKnowledgeQaPage = () => {
    window.open(`${window.location.origin}${window.location.pathname}?workspace=qa`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex h-screen min-w-[1240px] flex-col overflow-hidden bg-white text-[#333]">
      <header className="flex h-11 shrink-0 items-center border-b border-[#edf0f4] bg-white px-3">
        <button
          type="button"
          onClick={onBackProject}
          aria-label="返回项目详情"
          title="返回项目详情"
          className="mr-3 flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#4ec6ff] to-[#158fff] text-white shadow-sm"
        >
          <FileText className="h-4 w-4" />
        </button>
        <div className="max-w-[280px] truncate text-[14px] font-semibold leading-5">CPET管理手册.docx</div>
        <span className="ml-4 text-[12px] text-[#666]">字数：</span>
        <span className="ml-1 text-[12px] text-[#999]">0 / 2393</span>
        <span className="mx-2 h-3 w-px bg-[#e5e7ec]" />
        <span className="text-[12px] text-[#666]">句数：</span>
        <span className="ml-1 text-[12px] text-[#999]">0 / 80</span>
        <span className="ml-3 inline-flex h-5 min-w-7 items-center justify-center rounded-full border border-[#e5e7ec] px-2 text-[12px] text-[#666]">
          30
        </span>
        <button type="button" className="ml-auto h-7 rounded-md bg-[#00befa] px-4 text-[12px] font-medium text-white hover:bg-[#00b4fa]">
          提交任务
        </button>
        <button type="button" className="ml-2 h-7 rounded-md border border-[#e5e7ec] bg-white px-4 text-[12px] text-[#666] hover:border-[#00c6f3] hover:text-[#00b4fa]">
          导出译稿
        </button>
        <button type="button" aria-label="帮助" className="ml-3 h-7 w-7 rounded-full text-[13px] text-[#999] hover:bg-[#f7f8fa] hover:text-[#00b4fa]">
          ?
        </button>
        <button type="button" aria-label="用户中心" className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#a5edff] to-[#19bdf0] text-white shadow-sm">
          <UserRound className="h-3.5 w-3.5" />
        </button>
      </header>

      <section className="shrink-0 border-b border-[#edf0f4] bg-[#f9fcff]">
        <div className="flex h-9 items-center gap-2 px-3 text-[12px] leading-[18px] text-[#666]">
          {toolbarGroups.map((group, groupIndex) => (
            <div key={group.join("-")} className="flex items-center gap-1 border-r border-[#e9eef5] pr-2 last:border-r-0">
              {group.map((item) => (
                <button
                  key={`${groupIndex}-${item}`}
                  type="button"
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-2 hover:bg-white hover:text-[#00b4fa] ${
                    item === "清空" || item === "清除样式" ? "text-[#c4c8d0]" : ""
                  } ${item === "B" ? "font-semibold" : ""} ${item === "I" ? "italic" : ""} ${item === "U" ? "underline" : ""}`}
                >
                  {item}
                </button>
              ))}
              {groupIndex === 3 && <span className="ml-1 h-4 w-7 rounded-full bg-[#d7dde6]" />}
            </div>
          ))}
        </div>
        <div className="grid h-8 grid-cols-[46px_minmax(420px,1fr)_minmax(520px,1.05fr)_92px] items-center border-t border-[#edf0f4] bg-white text-[12px] text-[#666]">
          <div className="px-3">句Q</div>
          <div className="flex items-center gap-3 border-l border-[#edf0f4] px-3">
            <span>原文：简体中文</span>
            <div className="ml-auto flex h-6 w-[190px] items-center rounded border border-[#e5e7ec] bg-white px-2">
              <input className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#c4c8d0]" placeholder="搜索原文" />
              <Search className="h-3.5 w-3.5 text-[#999]" />
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-[#edf0f4] px-3">
            <span>译文：英语</span>
            <div className="ml-auto flex h-6 w-[190px] items-center rounded border border-[#e5e7ec] bg-white px-2">
              <input className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#c4c8d0]" placeholder="搜索译文" />
              <Search className="h-3.5 w-3.5 text-[#999]" />
            </div>
          </div>
          <div className="flex items-center justify-around border-l border-[#edf0f4]">
            <span>QA</span>
            <span>状态</span>
          </div>
        </div>
      </section>

      <main className="flex min-h-0 flex-1 bg-white">
        <section className="min-w-0 flex-1 overflow-auto">
          <div className="min-w-[980px]">
            {webcatSegments.map((segment) => (
              <div
                key={segment.no}
                className={`grid min-h-9 grid-cols-[46px_minmax(420px,1fr)_minmax(520px,1.05fr)_92px] border-b border-[#f0f1f3] text-[13px] leading-5 ${
                  segment.active ? "bg-[#fbfdff]" : "hover:bg-[rgba(0,198,243,.04)]"
                }`}
              >
                <div className="flex items-center gap-2 px-1.5 text-[#666]">
                  <input type="checkbox" aria-label={`选择第 ${segment.no} 句`} className="h-3.5 w-3.5 rounded border-[#d9dee8] accent-[#00befa]" />
                  <span className="w-6 text-right text-[12px]">{segment.no}</span>
                </div>
                <div className="flex items-center border-l border-[#f0f1f3] px-3 py-2 text-[#333]">
                  {segment.source}
                </div>
                <div className="relative border-l border-[#f0f1f3] px-3 py-2 text-[#333]">
                  <div
                    className={`min-h-7 rounded px-2 py-1 ${
                      segment.active ? "border border-[#00befa] bg-[#eefbff] shadow-[0_0_0_2px_rgba(0,198,243,.08)]" : ""
                    }`}
                  >
                    {segment.target}
                  </div>
                  {(segment.no === 154 || segment.no === 157 || segment.no === 159 || segment.no === 165 || segment.no === 167) && (
                    <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-[#8be8ff]" />
                  )}
                </div>
                <div className="flex items-center justify-between border-l border-[#f0f1f3] px-2 text-[12px]">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#edf1f5]" />
                  <span
                    className={`font-medium ${
                      segment.origin === "rep"
                        ? "text-[#ff7a45]"
                        : segment.origin === "mt"
                          ? "text-[#00aeda]"
                          : "text-[#52c41a]"
                    }`}
                  >
                    {segment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside
          className={`shrink-0 overflow-hidden border-l border-[#dceffb] bg-[#eef8ff] p-3 transition-[width] duration-200 ${
            activeAssistantTab === "智能问答" ? "w-[760px]" : "w-[360px]"
          }`}
        >
          <div className="mb-3 flex h-8 items-center gap-5 overflow-x-auto border-b border-[#d8edf8] text-[13px] text-[#333]">
            {webcatAssistantTabs.map((tab) => (
              <div key={tab} className="relative flex h-8 shrink-0 items-center gap-1 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setActiveAssistantTab(tab)}
                  className={`h-8 ${
                    tab === activeAssistantTab ? "font-medium text-[#00aeda]" : "text-[#333] hover:text-[#00b4fa]"
                  }`}
                >
                  {tab}
                </button>
                {tab === "智能问答" && (
                  <button
                    type="button"
                    aria-label="新开页面进入智能问答"
                    title="新开页面进入智能问答"
                    onClick={openKnowledgeQaPage}
                    className="flex h-5 w-5 items-center justify-center rounded text-[#8aa4b4] hover:bg-white hover:text-[#00aeda]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
                {tab === activeAssistantTab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-[#00befa]" />}
              </div>
            ))}
          </div>
          {activeAssistantTab === "智能问答" ? (
            <div className="h-[calc(100vh-185px)] overflow-hidden rounded-md border border-[#dceffb] bg-white shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
              <KnowledgeQaWorkspace embedded onOpenTranslate={onBackProject} />
            </div>
          ) : (
            <div className="rounded-lg bg-white p-3 shadow-[0_1px_10px_rgba(32,22,120,0.04)]">
              <div className="mb-2 text-[13px] leading-5 text-[#333]">
                3）与公司的其他政策和目标同等重要，由各级最高管理者签发，且可公开获取。
              </div>
              <div className="text-[13px] leading-5 text-[#7d8a9d]">
                3)It shall be equally important as other company policies and objectives, issued by top management at all levels, and publicly accessible.
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#999]">
                <button type="button" className="h-6 rounded bg-[#e6f9ff] px-3 text-[#00aeda] hover:bg-[#d7f5ff]">应用</button>
                <span className="ml-auto">语料填充</span>
                <span className="font-medium text-[#52c41a]">100%</span>
                <span>2026-06-09 11:11</span>
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="flex h-9 shrink-0 items-center border-t border-[#edf0f4] bg-white px-3 text-[12px] text-[#666]">
        <button type="button" className="inline-flex items-center gap-1 hover:text-[#00b4fa]">
          原文预览
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="收起预览" className="ml-3 h-6 w-6 rounded border border-[#e5e7ec] text-[#999] hover:border-[#00c6f3] hover:text-[#00b4fa]">
          ^
        </button>
        <button type="button" aria-label="全屏预览" className="ml-1 h-6 w-6 rounded border border-[#e5e7ec] text-[#999] hover:border-[#00c6f3] hover:text-[#00b4fa]">
          ⛶
        </button>
        <span className="ml-3">CPET管理手册.docx</span>
        <span className="ml-auto">总148句</span>
      </footer>
    </div>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState<"translate" | "project" | "qa" | "webcat">(() => {
    const requestedWorkspace = new URLSearchParams(window.location.search).get("workspace");
    if (
      requestedWorkspace === "translate" ||
      requestedWorkspace === "project" ||
      requestedWorkspace === "qa" ||
      requestedWorkspace === "webcat"
    ) {
      return requestedWorkspace;
    }
    return "translate";
  });

  if (window.location.pathname === "/document-preview") {
    return <DocumentPreviewPage />;
  }

  if (workspace === "qa") {
    return (
      <KnowledgeQaWorkspace
        onOpenTranslate={() => setWorkspace("translate")}
        onOpenProject={() => setWorkspace("project")}
      />
    );
  }

  if (workspace === "project") {
    return (
      <ProjectManagementPage
        onOpenTranslate={() => setWorkspace("translate")}
        onOpenKnowledgeQa={() => setWorkspace("qa")}
        onOpenWebcat={() => setWorkspace("webcat")}
      />
    );
  }

  if (workspace === "webcat") {
    return <WebCatPage onBackProject={() => setWorkspace("project")} />;
  }

  return (
    <DocumentFastTranslatePage
      onOpenKnowledgeQa={() => setWorkspace("qa")}
      onOpenProject={() => setWorkspace("project")}
    />
  );
}
