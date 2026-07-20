import { v4 as uuidv4 } from "uuid";
import { GeojsonsStateCreator } from "./store";

export interface SavedQrCode {
  id: string;
  name: string;
  data: string;
  scannedAt: number;
}

interface QrCodesSnapshot {
  savedQrCodes: SavedQrCode[];
  selectedQrCodeId: string | null;
}

export interface QrCodesSlice {
  savedQrCodes: SavedQrCode[];
  selectedQrCodeId: string | null;
  qrUndoStack: QrCodesSnapshot[];
  qrRedoStack: QrCodesSnapshot[];
  addQrCode: (data: string, name?: string) => void;
  removeQrCode: (id: string) => void;
  updateQrCodeName: (id: string, name: string) => void;
  selectQrCode: (id: string | null) => void;
  undoQrCodes: () => void;
  redoQrCodes: () => void;
}

const historyLimit = 50;

const createSnapshot = (state: QrCodesSlice): QrCodesSnapshot => ({
  savedQrCodes: state.savedQrCodes.map((qrCode) => ({ ...qrCode })),
  selectedQrCodeId: state.selectedQrCodeId,
});

const rememberCurrentState = (state: QrCodesSlice) => {
  state.qrUndoStack = [...state.qrUndoStack.slice(-(historyLimit - 1)), createSnapshot(state)];
  state.qrRedoStack = [];
};

export const createQrCodesSlice: GeojsonsStateCreator<QrCodesSlice> = (set) => ({
  savedQrCodes: [],
  selectedQrCodeId: null,
  qrUndoStack: [],
  qrRedoStack: [],
  addQrCode: (data, name) =>
    set((state) => {
      rememberCurrentState(state);
      const id = uuidv4();
      state.savedQrCodes.unshift({
        id,
        name: name?.trim() || `QR #${state.savedQrCodes.length + 1}`,
        data,
        scannedAt: Date.now(),
      });
      state.selectedQrCodeId = id;
    }),
  removeQrCode: (id) =>
    set((state) => {
      if (!state.savedQrCodes.some((qr) => qr.id === id)) return;
      rememberCurrentState(state);
      state.savedQrCodes = state.savedQrCodes.filter((qr) => qr.id !== id);
      if (state.selectedQrCodeId === id) {
        state.selectedQrCodeId = state.savedQrCodes[0]?.id ?? null;
      }
    }),
  updateQrCodeName: (id, name) =>
    set((state) => {
      const qr = state.savedQrCodes.find((q) => q.id === id);
      if (!qr || qr.name === name) return;
      rememberCurrentState(state);
      qr.name = name;
    }),
  selectQrCode: (id) =>
    set((state) => {
      state.selectedQrCodeId = id;
    }),
  undoQrCodes: () =>
    set((state) => {
      const previous = state.qrUndoStack.pop();
      if (!previous) return;
      state.qrRedoStack = [...state.qrRedoStack.slice(-(historyLimit - 1)), createSnapshot(state)];
      state.savedQrCodes = previous.savedQrCodes;
      state.selectedQrCodeId = previous.selectedQrCodeId;
    }),
  redoQrCodes: () =>
    set((state) => {
      const next = state.qrRedoStack.pop();
      if (!next) return;
      state.qrUndoStack = [...state.qrUndoStack.slice(-(historyLimit - 1)), createSnapshot(state)];
      state.savedQrCodes = next.savedQrCodes;
      state.selectedQrCodeId = next.selectedQrCodeId;
    }),
});
