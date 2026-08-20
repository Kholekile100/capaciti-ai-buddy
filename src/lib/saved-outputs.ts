import { useEffect, useState } from "react";

export type SavedOutput = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  done?: boolean;
};

const KEY = "worksmart:saved-outputs";
const EVENT = "worksmart:saved-outputs-change";

function read(): SavedOutput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedOutput[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedOutput[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function saveOutput(title: string, content: string) {
  const item: SavedOutput = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  write([item, ...read()]);
  return item;
}

export function removeOutput(id: string) {
  write(read().filter((item) => item.id !== id));
}

export function toggleOutputDone(id: string) {
  write(read().map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
}

export function useSavedOutputs() {
  const [items, setItems] = useState<SavedOutput[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}
