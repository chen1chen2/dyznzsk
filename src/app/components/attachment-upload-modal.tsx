import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function LevelSelect({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (next: string) => void;
  disabled?: boolean;
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
        className={`flex h-7 min-w-[110px] items-center justify-between gap-1 rounded-md border px-2 text-[12px] leading-5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
          value
            ? "border-[#e5e7ec] bg-white text-[#1f2329] hover:border-[#00c6f3]"
            : "border-[#fed7aa] bg-[#fff7ed] text-[#f97316] hover:border-[#f97316]"
        }`}
      >
        <span className="truncate">{value ?? "请选择"}</span>
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
                value === opt.value ? "text-[#00aeda]" : "text-[#3a4150]"
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
  onClose,
  onConfirm,
  embedded = false,
}: {
  open: boolean;
  initialFiles: File[];
  onClose: () => void;
  onConfirm: (files: AttachmentFile[]) => void;
  embedded?: boolean;
}) {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [batchLevel, setBatchLevel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<Record<string, number>>({});

  const clearUploadTimer = (id: string) => {
    const timer = timersRef.current[id];
    if (timer) {
      window.clearInterval(timer);
      delete timersRef.current[id];
    }
  };

  const clearAllUploadTimers = () => {
    Object.values(timersRef.current).forEach((timer) => window.clearInterval(timer));
    timersRef.current = {};
  };

  const startUpload = (id: string) => {
    clearUploadTimer(id);
    timersRef.current[id] = window.setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id !== id) return file;
          const nextProgress = Math.min(100, file.progress + 12 + Math.round(Math.random() * 10));
          if (nextProgress >= 100) {
            clearUploadTimer(id);
            return { ...file, status: "done", progress: 100 };
          }
          return { ...file, status: "uploading", progress: nextProgress };
        }),
      );
    }, 320);
  };

  useEffect(() => {
    if (!open) {
      clearAllUploadTimers();
      return;
    }
    clearAllUploadTimers();
    setFiles(
      initialFiles.map((f, index) => ({
        id: `${Date.now()}-${index}-${f.name}`,
        name: f.name,
        size: f.size,
        level: null,
        status: "pending",
        progress: 0,
      })),
    );
    setBatchLevel(null);
    return clearAllUploadTimers;
  }, [open, initialFiles]);

  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const handleRemove = (id: string) => {
    clearUploadTimer(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddMore = (incoming: FileList | null) => {
    if (!incoming) return;
    const defaultLevel = batchLevel ?? files.find((file) => file.level)?.level ?? null;
    const list = Array.from(incoming).map((f, index) => ({
      id: `${Date.now()}-${index}-${f.name}`,
      name: f.name,
      size: f.size,
      level: defaultLevel,
      status: defaultLevel ? ("uploading" as const) : ("pending" as const),
      progress: defaultLevel ? 8 : 0,
    }));
    setFiles((prev) => [...prev, ...list]);
    if (defaultLevel) list.forEach((file) => startUpload(file.id));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleBatchLevel = (level: string) => {
    setBatchLevel(level);
    const idsToUpload = files
      .filter((file) => file.status === "pending")
      .map((file) => file.id);
    setFiles((prev) =>
      prev.map((f) =>
        idsToUpload.includes(f.id)
          ? { ...f, level, status: "uploading", progress: 8 }
          : f,
      ),
    );
    idsToUpload.forEach(startUpload);
  };

  const handleFileLevel = (id: string, level: string) => {
    setBatchLevel((current) => current ?? level);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, level, status: "uploading", progress: 8 }
          : f,
      ),
    );
    startUpload(id);
  };

  if (!open) return null;

  return (
    <div
      className={
        embedded
          ? "absolute inset-0 z-50 flex items-center justify-center bg-white/70 p-3 backdrop-blur-[1px]"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      }
      onClick={onClose}
    >
      <div
        className={
          embedded
            ? "flex max-h-[calc(100%-24px)] w-full max-w-[680px] flex-col rounded-lg bg-white shadow-2xl"
            : "flex max-h-[80vh] w-[720px] flex-col rounded-xl bg-white shadow-2xl"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={embedded ? "flex items-start justify-between gap-3 px-4 pt-4" : "flex items-center justify-between px-6 pt-5"}>
          <div className={embedded ? "min-w-0" : "flex items-center gap-3"}>
            <span className="text-[16px] font-medium leading-6 text-[#1f2329]">
              上传附件
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#9098a4] hover:bg-[#f1f3f6] disabled:cursor-not-allowed disabled:opacity-50"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className={embedded ? "mt-4 flex flex-col gap-3 border-b border-[#eef0f3] px-4 pb-3" : "mt-4 flex items-center justify-between border-b border-[#eef0f3] px-6 pb-3"}>
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
                className="flex items-center gap-1 rounded-md border border-[#e5e7ec] px-2.5 py-1 text-[12px] text-[#3a4150] hover:border-[#00c6f3] hover:text-[#00aeda] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                继续添加
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#6b7280]">批量设置：</span>
            <LevelSelect
              value={batchLevel}
              onChange={handleBatchLevel}
            />
          </div>
        </div>

        {/* List */}
        <div className={embedded ? "flex-1 overflow-y-auto px-4 py-3" : "flex-1 overflow-y-auto px-6 py-3"}>
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="mb-2 h-8 w-8 text-[#cbd0d8]" />
              <div className="text-[13px] text-[#6b7280]">暂无文件</div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 rounded-md border border-[#00c6f3] px-3 py-1.5 text-[13px] text-[#00aeda] hover:bg-[#e8f9fe] disabled:cursor-not-allowed disabled:border-[#e5e7ec] disabled:text-[#c0c6d0] disabled:hover:bg-white"
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
                            className="h-full rounded-full bg-[#00befa] transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] text-[#6b7280]">
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
                      onChange={(level) => handleFileLevel(file.id, level)}
                      disabled={file.status === "uploading" || file.status === "done"}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(file.id)}
                      title="移除"
                      className="rounded p-1 text-[#9098a4] hover:bg-[#f1f3f6] hover:text-[#ef4444] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className={embedded ? "flex justify-end gap-2 border-t border-[#eef0f3] px-4 py-3" : "flex justify-end gap-2 border-t border-[#eef0f3] px-6 py-3"}>
            <button
              onClick={onClose}
              className="rounded-md border border-[#e5e7ec] px-4 py-1.5 text-[13px] text-[#3a4150] hover:bg-[#f1f3f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(files)}
              disabled={!allDone}
              className="rounded-md bg-[#00befa] px-4 py-1.5 text-[13px] text-white shadow-sm hover:bg-[#00b4fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              确定
            </button>
        </div>
      </div>
    </div>
  );
}
