import { useState } from "react";
import {
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

type Item = {
  id: string;
  name: string;
  level: string;
  lang: string;
  documents: {
    name: string;
    level: string;
    versions?: string[];
  }[];
  description: string;
  updated: string;
  tags: string[];
  pinned?: boolean;
  documentNotice?: string;
};

const handheldDocs = [
  "产品说明书-封面及版本记录.pdf",
  "产品说明书-设备概览.docx",
  "产品说明书-安全须知.pdf",
  "产品说明书-快速开始指南.pdf",
  "硬件接口定义.xlsx",
  "屏幕菜单说明.docx",
  "电池与充电规范.pdf",
  "通讯参数配置说明.docx",
  "蓝牙配对流程.pdf",
  "无线链路测试记录.xlsx",
  "常见故障排查.docx",
  "维护保养手册.pdf",
  "包装清单.xlsx",
  "运输与存储要求.pdf",
  "固件升级指南.docx",
  "出厂检验报告.xlsx",
  "用户培训材料.pptx",
  "术语抽取样本文档.pdf",
  "多语种术语对照表.xlsx",
  "通讯器场景问答.docx",
  "项目验收说明.pdf",
  "售后服务条款.docx",
].map((name, index) => ({
  name,
  level: index % 5 === 0 ? "2 - 内部" : "1 - 公开",
  ...(index === 0
    ? {
        name: "产品说明书-封面及版本记录-V10.pdf",
        versions: ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"],
      }
    : {}),
}));

const makeDocuments = (names: string[]) =>
  names.map((name, index) => ({
    name,
    level: index % 4 === 0 ? "2 - 内部" : "1 - 公开",
    ...(index === 0
      ? {
          name: name.replace(/(\.[^.]+)$/, "-V10$1"),
          versions: ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"],
        }
      : {}),
  }));

const formatSecurityLevel = (level: string) =>
  level.replace(/^\s*\d+\s*-\s*/, "");

const DOCUMENT_PAGE_SIZE = 5;

const items: Item[] = [
  {
    id: "1",
    name: "文档快翻知识库",
    level: "1 - 公开",
    lang: "简体中文 - 英语",
    documents: handheldDocs,
    description:
      "本库维护文档快翻场景中上传的产品说明、接口定义、测试记录、交付清单等文件，适用于快速检索文档内容和抽取术语。",
    updated: "2026-05-15",
    tags: ["手持设备", "通讯器"],
    pinned: true,
    documentNotice:
      "本上上传且涉密等级≤人员密级的文件才出现在列表中",
  },
  {
    id: "2",
    name: "手持通讯器产品说明4页-05061326-项目术语库",
    level: "1 - 公开",
    lang: "简体中文 - 英语",
    documents: makeDocuments([
      "05061326-产品说明书.pdf",
      "05061326-术语抽取结果.xlsx",
      "通讯器操作流程.docx",
      "设备参数对照表.xlsx",
      "用户反馈问题汇总.docx",
      "交付版本说明.pdf",
    ]),
    description:
      "本库维护 05061326 批次手持通讯器相关说明文档、术语抽取结果、操作流程和交付资料。",
    updated: "2026-05-06",
    tags: ["手持设备"],
  },
  {
    id: "3",
    name: "模块_子模块_陈琛_V1.x-04291524-项目术语库",
    level: "1 - 公开",
    lang: "简体中文-英语-法语",
    documents: makeDocuments([
      "模块子模块设计说明.docx",
      "陈琛_V1.x-接口定义.xlsx",
      "模块化装配指南.pdf",
      "飞行装置术语表.xlsx",
      "版本差异说明.docx",
    ]),
    description:
      "本库维护模块与子模块设计、接口定义、装配说明、飞行装置术语和版本差异文档。",
    updated: "2026-04-29",
    tags: ["飞行装置", "模块化"],
  },
  {
    id: "4",
    name: "换行测试-项目术语库",
    level: "1 - 公开",
    lang: "简体中文-英语-日语-韩语",
    documents: makeDocuments([
      "换行测试样本文档.docx",
      "多语种换行校验.xlsx",
      "排版规则说明.pdf",
    ]),
    description:
      "本库维护换行、排版和多语种显示测试相关样本文档，用于校验术语展示和文档解析效果。",
    updated: "2026-04-21",
    tags: ["测试"],
  },
  {
    id: "5",
    name: "几个字的文件-项目术语库",
    level: "1 - 公开",
    lang: "简体中文-英语-法语-德语-俄语",
    documents: makeDocuments([
      "短文件样例.docx",
      "文件命名规则.pdf",
      "样例术语表.xlsx",
      "多语种校对记录.docx",
    ]),
    description:
      "本库维护短文件、命名规则、样例术语和多语种校对记录，适合进行轻量文档验证。",
    updated: "2026-04-15",
    tags: ["文档", "样例"],
  },
  {
    id: "6",
    name: "关键语种多端AI实时字幕同传平台-1209修订版-项目术语库",
    level: "1 - 公开",
    lang: "简体中文-英语-法语-日语-韩语-德语-俄语-西班牙语",
    documents: makeDocuments([
      "1209修订版需求说明.pdf",
      "AI实时字幕平台方案.docx",
      "关键语种术语表.xlsx",
      "同传场景测试报告.pdf",
      "多端适配说明.docx",
      "字幕延迟评估.xlsx",
      "语音识别接口说明.pdf",
      "平台交付清单.docx",
    ]),
    description:
      "本库维护 AI 实时字幕同传平台的需求、方案、关键语种术语、测试报告和多端适配资料。",
    updated: "2026-04-13",
    tags: ["AI", "字幕", "同传", "多语种"],
  },
  {
    id: "7",
    name: "语音识别",
    level: "1 - 公开",
    lang: "简体中文 - 英语",
    documents: [{ name: "语音识别术语样本.docx", level: "1 - 公开" }],
    description:
      "本库维护语音识别场景下的术语样本和基础问答材料，用于识别相关知识点检索。",
    updated: "2026-04-13",
    tags: ["语音", "识别"],
  },
];

export function KnowledgeBaseModal({
  open,
  onClose,
  onConfirm,
  embedded = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm?: (count: number) => void;
  embedded?: boolean;
}) {
  const [tab, setTab] = useState<"mine" | "company">("mine");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["1"]),
  );
  const [query, setQuery] = useState("");
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(
    null,
  );
  const [documentQuery, setDocumentQuery] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [selectedDocumentKeys, setSelectedDocumentKeys] = useState<Set<string>>(
    () =>
      new Set(
        items.flatMap((item) =>
          item.documents.map((document) => `${item.id}:${document.name}`),
        ),
      ),
  );
  const [draftDocumentKeys, setDraftDocumentKeys] = useState<Set<string>>(
    () =>
      new Set(
        items.flatMap((item) =>
          item.documents.map((document) => `${item.id}:${document.name}`),
        ),
      ),
  );
  const [hoveredKnowledgeBaseId, setHoveredKnowledgeBaseId] = useState<
    string | null
  >(null);

  if (!open) return null;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleDocument = (key: string) => {
    setDraftDocumentKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const cancelDocumentSelection = () => {
    setDraftDocumentKeys(new Set(selectedDocumentKeys));
    setOpenDocumentId(null);
  };

  const confirmDocumentSelection = () => {
    setSelectedDocumentKeys(new Set(draftDocumentKeys));
    setOpenDocumentId(null);
  };

  const q = query.trim().toLowerCase();
  const filtered = items
    .filter((i) => {
      if (i.pinned) return true;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  const openDocumentItem = filtered.find((item) => item.id === openDocumentId);

  const renderDocumentPanel = (it: Item, panelMode: "popover" | "embedded") => {
    const normalizedDocumentQuery = documentQuery.trim().toLowerCase();
    const filteredDocuments = it.documents.filter((document) =>
      document.name.toLowerCase().includes(normalizedDocumentQuery),
    );
    const documentPageCount = Math.max(
      1,
      Math.ceil(filteredDocuments.length / DOCUMENT_PAGE_SIZE),
    );
    const currentDocumentPage = Math.min(documentPage, documentPageCount);
    const pagedDocuments = filteredDocuments.slice(
      (currentDocumentPage - 1) * DOCUMENT_PAGE_SIZE,
      currentDocumentPage * DOCUMENT_PAGE_SIZE,
    );
    const draftDocumentCount = it.documents.filter((document) =>
      draftDocumentKeys.has(`${it.id}:${document.name}`),
    ).length;

    return (
      <div
        role="dialog"
        aria-label={`${it.name}的关联文档`}
        className={
          panelMode === "embedded"
            ? "absolute inset-x-4 bottom-16 top-[104px] z-30 flex flex-col rounded-lg border border-[#e5e7ec] bg-white p-3 text-[#1f2329] shadow-xl"
            : `absolute right-0 top-7 z-20 w-[440px] rounded-lg border border-[#e5e7ec] bg-white p-3 text-[#1f2329] shadow-xl ${
                openDocumentId === it.id ? "block" : "hidden"
              }`
        }
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-medium leading-5">
            关联文档
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[12px] text-[#6b7280]">
              {draftDocumentCount}/{it.documents.length}
            </span>
            <button
              type="button"
              onClick={cancelDocumentSelection}
              className="flex h-6 w-6 items-center justify-center rounded text-[#9098a4] hover:bg-[#f1f3f6] hover:text-[#1f2329]"
              title="关闭关联文档"
              aria-label="关闭关联文档"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mb-2 flex items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-1.5 text-[12px] text-[#f97316]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 truncate">
            {it.documentNotice ?? "涉密等级≤人员密级的文件才出现在列表中"}
          </span>
        </div>
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9098a4]" />
          <input
            value={documentQuery}
            onChange={(event) => {
              setDocumentQuery(event.target.value);
              setDocumentPage(1);
            }}
            placeholder="按文件名称筛选"
            className="h-8 w-full rounded-md border border-[#e5e7ec] bg-white pl-8 pr-3 text-[12px] outline-none placeholder:text-[#9098a4] focus:border-[#00c6f3]"
          />
        </div>
        <div className={panelMode === "embedded" ? "min-h-0 flex-1 overflow-y-auto" : "min-h-[235px]"}>
          {pagedDocuments.length > 0 ? (
            pagedDocuments.map((doc, index) => {
              const documentKey = `${it.id}:${doc.name}`;
              const documentChecked = draftDocumentKeys.has(documentKey);
              return (
                <div
                  key={`${doc.name}-${index}`}
                  className="flex items-start gap-2 border-b border-[#f3f4f7] py-2.5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleDocument(documentKey)}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      documentChecked
                        ? "border-[#00befa] bg-[#00befa]"
                        : "border-[#cbd0d8] bg-white"
                    }`}
                    aria-label={`${documentChecked ? "取消选择" : "选择"} ${doc.name}`}
                    aria-pressed={documentChecked}
                  >
                    {documentChecked && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                        <path
                          d="M2.5 6.5l2.5 2.5 4.5-5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="min-w-0 break-words text-[12px] leading-5 text-[#3a4150]">
                        {doc.name}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded border border-[#a7f3d0] bg-[#ecfdf5] px-1.5 py-0.5 text-[12px] leading-4 text-[#10b981]">
                        <ShieldCheck className="h-3 w-3" />
                        {formatSecurityLevel(doc.level)}
                      </span>
                      {doc.versions && doc.versions.length > 1 && (
                        <span
                          title={`历史版本：${doc.versions.join("、")}`}
                          className="inline-flex shrink-0 items-center rounded border border-[#b5effb] bg-[#e8f9fe] px-1.5 py-0.5 text-[12px] leading-4 text-[#00aeda]"
                        >
                          最新版本 {doc.versions.at(-1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-[180px] items-center justify-center text-[12px] text-[#9098a4]">
              无匹配文件
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#eef0f3] pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDocumentPage((page) => Math.max(1, page - 1))}
              disabled={currentDocumentPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#e5e7ec] text-[#6b7280] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
              title="上一页"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[48px] text-center text-[12px] text-[#6b7280]">
              {currentDocumentPage}/{documentPageCount}
            </span>
            <button
              type="button"
              onClick={() => setDocumentPage((page) => Math.min(documentPageCount, page + 1))}
              disabled={currentDocumentPage >= documentPageCount}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#e5e7ec] text-[#6b7280] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
              title="下一页"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelDocumentSelection}
              className="h-8 rounded-md border border-[#e5e7ec] bg-white px-3 text-[12px] text-[#3a4150] hover:bg-[#f8fafc]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmDocumentSelection}
              className="h-8 rounded-md bg-[#00befa] px-3 text-[12px] text-white hover:bg-[#00b4fa]"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            ? "relative flex max-h-[calc(100%-24px)] w-full max-w-[680px] flex-col rounded-lg bg-white shadow-2xl"
            : "relative flex max-h-[80vh] w-[920px] flex-col rounded-xl bg-white shadow-2xl"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={embedded ? "flex items-start justify-between gap-3 px-4 pt-4" : "flex items-center justify-between px-6 pt-5"}>
          <div className={embedded ? "min-w-0" : "flex items-center gap-3"}>
            <span className="text-[16px] font-medium leading-6 text-[#1f2329]">
              添加知识库
            </span>
            <span className={embedded ? "mt-1 flex items-center gap-1 text-[12px] leading-5 text-[#f97316]" : "flex items-center gap-1 text-[12px] leading-5 text-[#f97316]"}>
              <AlertCircle className="h-3.5 w-3.5" />
              涉密等级≤人员密级的库才出现在列表中
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#9098a4] hover:bg-[#f1f3f6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs + actions */}
        <div className={embedded ? "flex flex-col gap-3 border-b border-[#eef0f3] px-4 pt-3" : "flex items-center justify-between border-b border-[#eef0f3] px-6 pt-4"}>
          <div className="flex gap-6">
            {[
              { key: "mine", label: "个人创建" },
              { key: "company", label: "企业协作" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  setTab(t.key as "mine" | "company")
                }
                className={`relative pb-3 text-[14px] font-medium leading-5 ${
                  tab === t.key
                    ? "text-[#00aeda]"
                    : "text-[#3a4150]"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#00c6f3]" />
                )}
              </button>
            ))}
          </div>
          <div className={embedded ? "flex items-center justify-between gap-3 pb-3" : "flex items-center gap-3 pb-2"}>
            <button className="flex items-center gap-1 text-[13px] font-medium leading-5 text-[#00aeda] hover:opacity-80">
              <PlusCircle className="h-3.5 w-3.5" />
              创建知识库
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索库名 / 概述 / 知识点"
              className={embedded ? "h-8 min-w-0 flex-1 rounded-md border border-[#e5e7ec] px-3 text-[13px] outline-none placeholder:text-[#9098a4] focus:border-[#00c6f3]" : "w-[180px] rounded-md border border-[#e5e7ec] px-3 py-1.5 text-[13px] outline-none placeholder:text-[#9098a4] focus:border-[#00c6f3]"}
            />
          </div>
        </div>

        {/* Table */}
        <div className={embedded ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-6"}>
          <table className="w-full text-[13px] leading-5">
            <thead className="sticky top-0 bg-white text-[13px] font-medium text-[#6b7280]">
              <tr className="flex items-center border-b border-[#eef0f3]">
                <th className="order-1 w-10 shrink-0 py-3 text-left">
                  <span className="block h-3.5 w-3.5 rounded-sm bg-[#00befa]" />
                </th>
                <th className="order-2 min-w-0 flex-1 py-3 text-left">库名</th>
                <th className="order-4 w-28 shrink-0 py-3 text-left">
                  涉密等级
                </th>
                <th className="order-5 w-40 shrink-0 py-3 text-left">
                  语种
                </th>
                <th className="order-3 w-20 shrink-0 py-3 text-left">关联文档</th>
                <th className="order-6 w-28 shrink-0 py-3 text-left">
                  更新时间
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const checked = selected.has(it.id);
                const selectedDocumentCount = it.documents.filter((document) =>
                  selectedDocumentKeys.has(`${it.id}:${document.name}`),
                ).length;
                return (
                  <tr
                    key={it.id}
                    className="flex items-center border-b border-[#f3f4f7] hover:bg-[#fafbfc]"
                  >
                    <td className="order-1 w-10 shrink-0 rounded-[100px] py-3">
                      <button
                        onClick={() => toggle(it.id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checked
                            ? "border-[#00befa] bg-[#00befa]"
                            : "border-[#cbd0d8] bg-white"
                        }`}
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 12 12"
                            className="h-3 w-3 text-white"
                            fill="none"
                          >
                            <path
                              d="M2.5 6.5l2.5 2.5 4.5-5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="order-2 min-w-0 flex-1 py-3 text-[#1f2329]">
                      <div
                        className="group relative inline-flex max-w-full"
                        onMouseEnter={() => setHoveredKnowledgeBaseId(it.id)}
                        onMouseLeave={() => setHoveredKnowledgeBaseId(null)}
                        onFocus={() => setHoveredKnowledgeBaseId(it.id)}
                        onBlur={() => setHoveredKnowledgeBaseId(null)}
                      >
                        <button
                          type="button"
                          className="max-w-[320px] break-words text-left text-[13px] leading-5 underline-offset-2 hover:text-[#00aeda] hover:underline"
                          aria-label={`查看 ${it.name} 概述和知识点`}
                        >
                          {it.name}
                        </button>
                        <div
                          className={`pointer-events-none absolute left-0 top-full z-20 mt-1 w-[320px] rounded-lg border border-[#e5e7ec] bg-white p-3 text-[#1f2329] shadow-xl group-hover:block ${
                            hoveredKnowledgeBaseId === it.id
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <div className="text-[12px] leading-5 text-[#3a4150]">
                            {it.description}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {it.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex h-5 items-center rounded border border-[#fed7aa] bg-[#fff7ed] px-1.5 text-[12px] text-[#f97316]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="order-4 w-28 shrink-0 py-3">
                      <span className="rounded border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-0.5 text-[12px] text-[#10b981]">
                        {formatSecurityLevel(it.level)}
                      </span>
                    </td>
                    <td className="order-5 w-40 shrink-0 py-3 text-[#3a4150]">
                      {(() => {
                        const map: Record<string, string> = {
                          简体中文: "中", 中文: "中", 英语: "英", 英文: "英",
                          法语: "法", 日语: "日", 韩语: "韩", 德语: "德",
                          俄语: "俄", 西班牙语: "西", 葡萄牙语: "葡",
                        };
                        const parts = it.lang.split(/\s*[-→,，、/]\s*/).filter(Boolean).map((p) => ({
                          short: map[p] || p.slice(0, 1),
                          full: p,
                        }));
                        const MAX = 3;
                        const visible = parts.slice(0, MAX);
                        const overflow = parts.slice(MAX);
                        return (
                          <span className="inline-flex max-w-full items-center gap-1 overflow-hidden">
                            {visible.map((p, i) => (
                              <span
                                key={i}
                                title={p.full}
                                className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-[#e8f9fe] px-1.5 text-[12px] text-[#00aeda]"
                              >
                                {p.short}
                              </span>
                            ))}
                            {overflow.length > 0 && (
                              <span
                                title={overflow.map((p) => p.full).join("、")}
                                className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-[#f1f3f6] px-1.5 text-[12px] text-[#6b7280]"
                              >
                                +{overflow.length}
                              </span>
                            )}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="order-3 w-20 shrink-0 py-3 text-[#3a4150]">
                      {it.documents.length > 0 ? (
                        <div
                          className="relative inline-flex"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDocumentId(it.id);
                              setDraftDocumentKeys(new Set(selectedDocumentKeys));
                              setDocumentQuery("");
                              setDocumentPage(1);
                            }}
                            className="rounded px-1 py-0.5 text-left text-[13px] leading-5 text-[#00aeda] underline-offset-2 hover:bg-[#e8f9fe] hover:underline"
                            aria-label={`查看关联文档，已选 ${selectedDocumentCount} 个，共 ${it.documents.length} 个`}
                            aria-expanded={openDocumentId === it.id}
                          >
                            {selectedDocumentCount}
                          </button>
                          {!embedded && renderDocumentPanel(it, "popover")}
                        </div>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="order-6 w-28 shrink-0 py-3 text-[#3a4150]">
                      {it.updated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eef0f3] px-6 py-3">
          <span className="text-[13px] text-[#6b7280]">
            已勾选 {selected.size}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-[#e5e7ec] px-4 py-1.5 text-[13px] text-[#3a4150] hover:bg-[#f1f3f6]"
            >
              取消
            </button>
            <button
              onClick={() => {
                onConfirm?.(selected.size);
                onClose();
              }}
              className="rounded-md bg-[#00befa] px-4 py-1.5 text-[13px] text-white hover:bg-[#00b4fa]"
            >
              确定
            </button>
          </div>
        </div>
        {embedded && openDocumentItem && renderDocumentPanel(openDocumentItem, "embedded")}
      </div>
    </div>
  );
}
