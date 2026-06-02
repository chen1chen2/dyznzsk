import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export type AttachmentFile = {
  id: string;
  name: string;
  size: number;
  level: string | null;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
};

const LEVEL_OPTIONS = [
  { value: "1 - 公开", label: "1 - 公开", tone: "green" as const },
  { value: "2 - 内部", label: "2 - 内部", tone: "orange" as const },
  { value: "3 - 秘密", label: "3 - 秘密", tone: "red" as const },
];

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv";
const DEFAULT_MAX_FILES = 5;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function LevelSelect({
  value,
  onChange,
  disabled,
  placeholder = "请选择",
}: {
  value: string | null;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-7 min-w-[140px] items-center justify-between gap-1 rounded-md border px-2 text-[12px] leading-5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
          value
            ? "border-[#e5e7ec] bg-white text-[#1f2329] hover:border-[#3b82f6]"
            : "border-[#fed7aa] bg-[#fff7ed] text-[#f97316] hover:border-[#f97316]"
        }`}
      >
        <span className="truncate">{value ?? placeholder}</span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-[140px] rounded-md border border-[#e5e7ec] bg-white py-1 shadow-lg">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] leading-5 hover:bg-[#f1f3f6] ${
                value === opt.value ? "text-[#3b82f6]" : "text-[#3a4150]"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <CheckCircle2 className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AttachmentUploadModal({
  open,
  initialFiles,
  maxFiles = DEFAULT_MAX_FILES,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialFiles: File[];
  maxFiles?: number;
  onClose: () => void;
  onConfirm: (files: AttachmentFile[]) => void;
}) {
  const uploadLimit = Math.max(0, maxFiles);
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [batchLevel, setBatchLevel] = useState<string | null>(null);
  const [limitTip, setLimitTip] = useState("");
  const [uploading, setUploading] = useState(false);
  const timersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showLimitToast = (message: string) => {
    setLimitTip(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setLimitTip("");
      toastTimerRef.current = null;
    }, 2400);
  };

  useEffect(() => {
    if (!open) return;
    setFiles(
      initialFiles.slice(0, uploadLimit).map((f, index) => ({
        id: `${Date.now()}-${index}-${f.name}`,
        name: f.name,
        size: f.size,
        level: null,
        status: "pending",
        progress: 0,
      })),
    );
    setBatchLevel(null);
    if (initialFiles.length > uploadLimit) {
      showLimitToast(`最多上传 ${uploadLimit} 个文件，已自动保留前 ${uploadLimit} 个`);
    } else {
      setLimitTip("");
    }
    setUploading(false);
    return () => {
      timersRef.current.forEach((t) => window.clearInterval(t));
      timersRef.current = [];
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [open, initialFiles, uploadLimit]);

  const allLevelsSet = files.length > 0 && files.every((f) => f.level !== null);
  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const anyUploading = files.some((f) => f.status === "uploading");
  const totalProgress = files.length
    ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
    : 0;

  const updateFile = (id: string, patch: Partial<AttachmentFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleRemove = (id: string) => {
    if (uploading) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddMore = (incoming: FileList | null) => {
    if (!incoming || uploading) return;
    const remaining = uploadLimit - files.length;
    if (remaining <= 0) {
      showLimitToast(`最多上传 ${uploadLimit} 个文件`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const incomingFiles = Array.from(incoming);
    const list = incomingFiles.slice(0, remaining).map((f, index) => ({
      id: `${Date.now()}-${index}-${f.name}`,
      name: f.name,
      size: f.size,
      level: null as string | null,
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...list]);
    if (incomingFiles.length > remaining) {
      showLimitToast(`最多上传 ${uploadLimit} 个文件，本次已添加 ${remaining} 个`);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleBatchLevel = (level: string) => {
    setBatchLevel(level);
    setFiles((prev) => prev.map((f) => ({ ...f, level })));
  };

  const startUpload = () => {
    if (!allLevelsSet || uploading) return;
    setUploading(true);
    timersRef.current.forEach((t) => window.clearInterval(t));
    timersRef.current = [];

    files.forEach((file) => {
      if (file.status === "done") return;
      updateFile(file.id, { status: "uploading", progress: 0 });
      const step = 6 + Math.floor(Math.random() * 12);
      const timer = window.setInterval(() => {
        setFiles((prev) => {
          const target = prev.find((f) => f.id === file.id);
          if (!target) return prev;
          const next = Math.min(100, target.progress + step);
          const isDone = next >= 100;
          if (isDone) {
            window.clearInterval(timer);
            timersRef.current = timersRef.current.filter((t) => t !== timer);
          }
          return prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress: next,
                  status: isDone ? "done" : "uploading",
                }
              : f,
          );
        });
      }, 280);
      timersRef.current.push(timer);
    });
  };

  useEffect(() => {
    if (open && allLevelsSet && !uploading && !allDone) {
      startUpload();
    }
  }, [open, allLevelsSet, uploading, allDone]);

  useEffect(() => {
    if (uploading && allDone) {
      setUploading(false);
    }
  }, [uploading, allDone]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={() => !uploading && onClose()}
    >
      <div
        className="flex max-h-[80vh] w-[720px] flex-col rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-medium leading-6 text-[#1f2329]">
              上传附件
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded p-1 text-[#9098a4] hover:bg-[#f1f3f6] disabled:cursor-not-allowed disabled:opacity-50"
            title={uploading ? "上传中无法关闭" : "关闭"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex items-center justify-between border-b border-[#eef0f3] px-6 pb-3">
          <div className="flex items-center gap-3 text-[13px] text-[#3a4150]">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleAddMore(e.target.files)}
            />
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || files.length >= uploadLimit}
                className="flex items-center gap-1 rounded-md border border-[#e5e7ec] px-2.5 py-1 text-[12px] text-[#3a4150] hover:border-[#3b82f6] hover:text-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                继续添加
              </button>
            )}
            <span className="text-[12px] text-[#9098a4]">
              已上传 {files.length} 个文档
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LevelSelect
              value={batchLevel}
              disabled={uploading || files.length === 0}
              placeholder="批量设置涉密等级"
              onChange={(level) => handleBatchLevel(level)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="mb-2 h-8 w-8 text-[#cbd0d8]" />
              <div className="text-[13px] text-[#6b7280]">暂无文件</div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || files.length >= uploadLimit}
                className="mt-3 rounded-md border border-[#3b82f6] px-3 py-1.5 text-[13px] text-[#3b82f6] hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                选择文件
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#f3f4f7]">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#60a5fa]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="min-w-0 flex-1 truncate text-[13px] text-[#1f2329]"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="shrink-0 text-[12px] text-[#9098a4]">
                        {formatSize(file.size)}
                      </span>
                    </div>
                    {file.status === "uploading" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#f1f3f6]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3da0ff] to-[#3478f6] transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#6b7280]">
                          {file.progress}%
                        </span>
                      </div>
                    )}
                    {file.status === "done" && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#10b981]">
                        <CheckCircle2 className="h-3 w-3" />
                        上传完成
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <LevelSelect
                      value={file.level}
                      disabled={file.status === "uploading"}
                      placeholder="请设置涉密等级"
                      onChange={(level) => updateFile(file.id, { level })}
                    />
                    {file.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#3478f6]" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemove(file.id)}
                        disabled={uploading}
                        title="移除"
                        className="rounded p-1 text-[#9098a4] hover:bg-[#f1f3f6] hover:text-[#ef4444] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eef0f3] px-6 py-3">
          <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
            {anyUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3478f6]" />
                正在上传 {totalProgress}%
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={uploading}
              className="rounded-md border border-[#e5e7ec] px-4 py-1.5 text-[13px] text-[#3a4150] hover:bg-[#f1f3f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(files)}
              disabled={!allDone}
              className="rounded-md bg-gradient-to-r from-[#3da0ff] to-[#3478f6] px-4 py-1.5 text-[13px] text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              确定
            </button>
          </div>
        </div>

        {limitTip && (
          <div className="fixed right-6 top-6 z-[60] rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-2 text-[13px] text-[#f97316] shadow-lg">
            {limitTip}
          </div>
        )}
      </div>
    </div>
  );
}
