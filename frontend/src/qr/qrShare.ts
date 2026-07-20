import type { SavedQrCode } from "@/store/qrCodesSlice";

const SHARE_VERSION = "1";
const MAX_QR_DATA_LENGTH = 16_384;
const MAX_DESCRIPTION_LENGTH = 300;

export interface SharedQrCode {
  data: string;
  description: string;
}

export function buildQrShareUrl(
  qrCode: Pick<SavedQrCode, "data" | "name">,
  currentUrl = window.location.href,
): string {
  if (!qrCode.data || qrCode.data.length > MAX_QR_DATA_LENGTH) {
    throw new Error("QR content is too large to share in a link");
  }

  const url = new URL(currentUrl);
  const hash = new URLSearchParams({
    share: SHARE_VERSION,
    data: qrCode.data,
    description: qrCode.name.trim().slice(0, MAX_DESCRIPTION_LENGTH) || "Shared QR code",
  });

  url.search = "";
  url.hash = hash.toString();
  return url.toString();
}

export function parseSharedQrCode(hash: string): SharedQrCode | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  if (params.get("share") !== SHARE_VERSION) return null;

  const data = params.get("data");
  if (!data || data.length > MAX_QR_DATA_LENGTH) return null;

  const rawDescription = params.get("description")?.trim() ?? "";
  const description = rawDescription.slice(0, MAX_DESCRIPTION_LENGTH) || "Shared QR code";

  return { data, description };
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Unable to copy text");
}
