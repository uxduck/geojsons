import { useState } from "react";
import { useStore } from "@/store/store";
import type { SavedQrCode } from "@/store/qrCodesSlice";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function QrCodeListItem({
  qrCode,
  isSelected,
}: {
  qrCode: SavedQrCode;
  isSelected: boolean;
}) {
  const selectQrCode = useStore.use.selectQrCode();
  const removeQrCode = useStore.use.removeQrCode();
  const updateQrCodeName = useStore.use.updateQrCodeName();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(qrCode.name);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const save = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== qrCode.name) {
      updateQrCodeName(qrCode.id, trimmed);
    } else {
      setDraft(qrCode.name);
    }
  };

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.data);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div
      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors group cursor-pointer ${
        isSelected
          ? "bg-primary/10 border-l-2 border-primary"
          : "border-l-2 border-transparent hover:bg-muted/50"
      }`}
      onClick={() => selectQrCode(qrCode.id)}
    >
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            className="font-medium text-sm bg-transparent border-b border-primary outline-none w-full"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(qrCode.name);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <p className="font-medium text-sm truncate">{qrCode.name}</p>
        )}
        <p className="text-xs text-muted-foreground truncate">{qrCode.data}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {formatRelativeTime(qrCode.scannedAt)}
      </span>
      <button
        type="button"
        className={`p-1 rounded transition-all shrink-0 ${
          copyStatus === "copied"
            ? "bg-primary/10 text-primary"
            : copyStatus === "error"
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-label={
          copyStatus === "copied"
            ? "Copied QR value"
            : copyStatus === "error"
              ? "Copy failed"
              : "Copy QR value"
        }
        title={
          copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy value"
        }
        onClick={(e) => {
          e.stopPropagation();
          void copyValue();
        }}
      >
        {copyStatus === "copied" ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <button
        className="p-1 rounded text-muted-foreground hover:text-foreground transition-all shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(qrCode.name);
          setEditing(true);
        }}
      >
        <Pencil size={14} />
      </button>
      <button
        className="p-1 rounded text-muted-foreground hover:text-destructive transition-all shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          removeQrCode(qrCode.id);
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
