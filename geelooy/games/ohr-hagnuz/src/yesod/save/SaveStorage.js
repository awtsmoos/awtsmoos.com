/**
 * B"H
 * @module SaveStorage
 * @description Browser localStorage adapter with a memory vessel for tests.
 */
import { SAVE_KEY } from './SaveSchema.js';

export const createMemoryStorage = () => {
  const box = new Map();
  return {
    getItem: key => box.has(key) ? box.get(key) : null,
    setItem: (key, value) => { box.set(key, String(value)); },
    removeItem: key => { box.delete(key); },
    clear: () => box.clear()
  };
};

export const defaultStorage = () => {
  try {
    const store = globalThis?.localStorage;
    const testKey = `${SAVE_KEY}:probe`;
    if (!store) return null;
    store.setItem(testKey, '1');
    store.removeItem(testKey);
    return store;
  } catch {
    return null;
  }
};

export const readRaw = (storage = defaultStorage(), key = SAVE_KEY) => {
  try { return storage?.getItem?.(key) ?? null; } catch { return null; }
};

export const writeRaw = (value, storage = defaultStorage(), key = SAVE_KEY) => {
  try { storage?.setItem?.(key, value); return !!storage; } catch { return false; }
};

export const removeRaw = (storage = defaultStorage(), key = SAVE_KEY) => {
  try { storage?.removeItem?.(key); return true; } catch { return false; }
};
