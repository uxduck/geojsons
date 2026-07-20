import { Check, Copy, Download, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useStore } from "@/store/store";
import type { SharedQrCode } from "./qrShare";
import { copyText } from "./qrShare";

export function SharedQrCodeDisplay({
  qrCode,
  onClose,
}: {
  qrCode: SharedQrCode;
  onClose: () => void;
}) {
  const addQrCode = useStore.use.addQrCode();
  const [copied, setCopied] = useState(false);

  const copyValue = async () => {
    try {
      await copyText(qrCode.data);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The value remains visible and selectable if clipboard access is unavailable.
    }
  };

  const save = () => {
    addQrCode(qrCode.data, qrCode.description);
    onClose();
  };

  return (
    <section className="relative h-full overflow-auto bg-[radial-gradient(circle_at_50%_-20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_54%)] px-5 py-6 sm:px-8">
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        aria-label="Close shared QR code"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      <div className="mx-auto flex min-h-full max-w-xl items-center justify-center">
        <article className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-background/90 shadow-[0_24px_70px_-38px_color-mix(in_oklab,var(--primary)_70%,transparent)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-dashed border-border px-6 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="grid size-6 place-items-center rounded-full bg-primary/10">
                <Share2 size={12} />
              </span>
              Shared QR
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              geojsons.com
            </span>
          </div>

          <div className="grid items-center gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.72fr)] sm:p-8">
            <div className="order-2 min-w-0 sm:order-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </p>
              <h2 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
                {qrCode.description}
              </h2>
              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  QR content
                </p>
                <p className="max-h-20 select-text overflow-auto break-all font-mono text-xs leading-relaxed text-foreground">
                  {qrCode.data}
                </p>
              </div>
            </div>

            <div className="order-1 mx-auto aspect-square w-full max-w-[230px] rounded-[1.4rem] bg-white p-4 shadow-[0_12px_35px_-20px_rgba(0,0,0,0.55)] sm:order-2">
              <QRCodeSVG
                value={qrCode.data}
                size={1000}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-muted/25 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => void copyValue()}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy value"}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              onClick={save}
            >
              <Download size={16} />
              Save a copy
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
