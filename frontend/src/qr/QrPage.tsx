import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { QrCodeDisplay } from "./QrCodeDisplay";
import { QrCodeList } from "./QrCodeList";
import { QrScanner } from "./QrScanner";
import { Plus, Sun, Moon, Monitor, Settings, GripHorizontal, Undo2, Redo2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { SharedQrCodeDisplay } from "./SharedQrCodeDisplay";
import { parseSharedQrCode } from "./qrShare";
import { useStore } from "@/store/store";

const themeOrder = ["light", "dark", "system"] as const;
const themeIcon = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  system: <Monitor size={18} />,
};
const isMacDevice = /Mac|iPhone|iPad/.test(navigator.platform);
const modifierKey = isMacDevice ? "Cmd" : "Ctrl";

export default function QrPage() {
  const [scanning, setScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sharedQrCode, setSharedQrCode] = useState(() => parseSharedQrCode(window.location.hash));
  const qrUndoStack = useStore.use.qrUndoStack();
  const qrRedoStack = useStore.use.qrRedoStack();
  const undoQrCodes = useStore.use.undoQrCodes();
  const redoQrCodes = useStore.use.redoQrCodes();
  const { theme, setTheme } = useTheme();
  const canUndo = qrUndoStack.length > 0;
  const canRedo = qrRedoStack.length > 0;

  useEffect(() => {
    const readSharedQrCode = () => setSharedQrCode(parseSharedQrCode(window.location.hash));
    window.addEventListener("hashchange", readSharedQrCode);
    return () => window.removeEventListener("hashchange", readSharedQrCode);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const wantsRedo = (key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey);
      const wantsUndo = key === "z" && !event.shiftKey;

      if (wantsUndo && canUndo) {
        event.preventDefault();
        undoQrCodes();
      } else if (wantsRedo && canRedo) {
        event.preventDefault();
        redoQrCodes();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRedo, canUndo, redoQrCodes, undoQrCodes]);

  const closeSharedQrCode = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setSharedQrCode(null);
  };

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-lg font-semibold">QR Codes</h1>
          <div className="flex items-center" role="group" aria-label="QR code history">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
              aria-label="Undo QR code change"
              title={`Undo · ${modifierKey}+Z`}
              disabled={!canUndo}
              onClick={undoQrCodes}
            >
              <Undo2 size={17} />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
              aria-label="Redo QR code change"
              title={`Redo · ${modifierKey}+Shift+Z`}
              disabled={!canRedo}
              onClick={redoQrCodes}
            >
              <Redo2 size={17} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setShowSettings((p) => !p)}
            >
              <Settings size={18} />
            </button>
            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[140px]">
                  <p className="text-xs text-muted-foreground px-2 py-1">Theme</p>
                  {themeOrder.map((t) => (
                    <button
                      key={t}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${theme === t ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                      onClick={() => {
                        setTheme(t);
                        setShowSettings(false);
                      }}
                    >
                      {themeIcon[t]}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => setScanning(true)}
          >
            <Plus size={16} />
            Import
          </button>
        </div>
      </div>

      {/* Resizable panels */}
      <Group orientation="vertical" className="flex-1">
        <Panel defaultSize={60} minSize={30}>
          {sharedQrCode ? (
            <SharedQrCodeDisplay qrCode={sharedQrCode} onClose={closeSharedQrCode} />
          ) : (
            <QrCodeDisplay />
          )}
        </Panel>
        <Separator className="w-full h-px bg-border flex items-center justify-center">
          <div className="h-4 drop-shadow w-5 z-10 bg-muted rounded-md px-0.5 flex items-center justify-center">
            <GripHorizontal className="text-muted-foreground" height={24} width={24} />
          </div>
        </Separator>
        <Panel defaultSize={40} minSize={15}>
          <QrCodeList />
        </Panel>
      </Group>

      {/* Scanner overlay */}
      {scanning && <QrScanner onClose={() => setScanning(false)} />}
    </div>
  );
}
