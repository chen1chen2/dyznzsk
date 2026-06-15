import { useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trash2,
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
    <aside className="flex w-[520px] shrink-0 flex-col border-l border-[#eef0f3] bg-white px-5 py-4">
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

export default function App() {
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
  const [citationOpen, setCitationOpen] = useState(false);
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
    setCitationOpen(false);
  };

  const handleSelectConv = (id: string) => {
    setDraftMode(false);
    setConversations((prev) => prev.map((c) => ({ ...c, active: c.id === id })));
  };

  const handleSend = () => {
    const text = input.trim();
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
    setCitationOpen(true);
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

  return (
    <div className="flex h-screen w-full bg-[#f7f8fb] text-[#1f2329]">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-[#eef0f3] bg-[#fafbfc] p-3">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3da0ff] to-[#3478f6] py-2.5 text-white shadow-sm hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span>新建对话</span>
        </button>

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
                  天坛奖怎么翻译
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
                    <button className="rounded p-1 hover:bg-[#f1f3f6] hover:text-[#3478f6]" title="重新生成">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded p-1 hover:bg-[#f1f3f6] hover:text-[#3478f6]" title="有帮助">
                      <ThumbsUp className="h-3.5 w-3.5" />
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

        <div className="px-6 pb-6">
          <div className="mx-auto max-w-[820px] rounded-2xl border border-[#e5e7ec] bg-white p-3 shadow-[0_2px_12px_rgba(20,20,43,0.04)]">
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
              placeholder="你可以向我提问我所知道的一切"
              rows={2}
              className="w-full resize-none bg-transparent px-2 py-1 text-[14px] outline-none placeholder:text-[#9098a4]"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                  className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#f1f3f6]"
                  title="上传附件"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setKbOpen(true)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] ${
                    kbCount > 0
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#2563eb]"
                      : "border-[#e5e7ec] text-[#3a4150] hover:border-[#3478f6] hover:text-[#3478f6]"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  知识库
                  {kbCount > 0 && (
                    <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3478f6] px-1 text-[11px] text-white">
                      {kbCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setWebOn((v) => !v)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] ${
                    webOn
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#2563eb]"
                      : "border-[#e5e7ec] text-[#3a4150] hover:border-[#3478f6] hover:text-[#3478f6]"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  互联网
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#9098a4]">{input.length}/5000</span>
                <button
                  onClick={handleSend}
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
      />

      <AttachmentUploadModal
        open={attachmentOpen}
        initialFiles={pendingFiles}
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
}
