import { useEffect, useRef, useState } from "react";
import { Check, Link, Share2, TriangleAlert } from "lucide-react";
import type { SavedQrCode } from "@/store/qrCodesSlice";
import { buildQrShareUrl, copyText } from "./qrShare";

type ShareStatus = "idle" | "copied" | "error";

export function QrShareButton({ qrCode }: { qrCode: SavedQrCode }) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const supportsNativeShare = typeof navigator.share === "function";

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const resetStatusLater = (nextStatus: Exclude<ShareStatus, "idle">) => {
    clearTimeout(resetTimer.current);
    setStatus(nextStatus);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2400);
  };

  const share = async () => {
    let url: string;
    try {
      url = buildQrShareUrl(qrCode);
    } catch {
      resetStatusLater("error");
      return;
    }

    if (supportsNativeShare) {
      try {
        await navigator.share({
          title: qrCode.name,
          text: qrCode.name,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await copyText(url);
      resetStatusLater("copied");
    } catch {
      resetStatusLater("error");
    }
  };

  const label = status === "copied" ? "Link copied" : status === "error" ? "Share failed" : "Share";

  return (
    <button
      type="button"
      className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        status === "copied"
          ? "bg-primary/10 text-primary"
          : status === "error"
            ? "bg-destructive/10 text-destructive"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      aria-label={`${label} ${qrCode.name}`}
      title={status === "idle" ? "Share a link to this QR code" : label}
      onClick={(event) => {
        event.stopPropagation();
        void share();
      }}
    >
      {status === "copied" ? (
        <Check size={13} />
      ) : status === "error" ? (
        <TriangleAlert size={13} />
      ) : supportsNativeShare ? (
        <Share2 size={13} />
      ) : (
        <Link size={13} />
      )}
      <span>{label}</span>
    </button>
  );
}
