/**
 * B"H
 * @module SaveRuntime
 * @description Snapshot, restore, autosave, export, import, and corruption-safe load.
 *
 * Chapter 402: The save file became a little ark. It does not trap life; it
 * carries the remembered names across floodwater. If the ark cracks, the game
 * keeps walking and leaves a clear report instead of drowning the boot.
 */
import { State } from '../../binah/State.js';
import { SAVE_KEY, SAVE_ROOTS, TRANSIENT_ROOTS, makeEnvelope } from './SaveSchema.js';
import { migrateEnvelope } from './SaveMigrations.js';
import { defaultStorage, readRaw, removeRaw, writeRaw } from './SaveStorage.js';

const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const nowMs = () => Date.now ? Date.now() : new Date().getTime();
let lastAutosaveAt = 0;
let lastAutosaveHash = '';

export const snapshotState = () => SAVE_ROOTS.reduce((data, key) => {
  if (typeof State[key] !== 'function') data[key] = clone(State[key]);
  return data;
}, {});

export const restoreState = data => {
  if (!data || typeof data !== 'object') return { ok: false, reason: 'missing-data' };
  for (const key of SAVE_ROOTS) if (Object.hasOwn(data, key)) State[key] = clone(data[key]);
  for (const key of TRANSIENT_ROOTS) {
    if (key === 'HeroPath') State.HeroPath = [];
    if (key === 'PathTarget') State.PathTarget = null;
    if (key === 'UiPanel') State.UiPanel = null;
  }
  State.releaseIntents?.();
  State.rememberMap?.(State.MapId);
  return { ok: true, restored: SAVE_ROOTS.filter(key => Object.hasOwn(data, key)) };
};

export const createSave = () => makeEnvelope(snapshotState());
export const serializeSave = (envelope = createSave()) => JSON.stringify(envelope);

export const saveGame = (storage = defaultStorage()) => {
  const envelope = createSave();
  const ok = writeRaw(serializeSave(envelope), storage);
  return { ok, key: SAVE_KEY, envelope };
};

export const loadSaveEnvelope = (storage = defaultStorage()) => {
  const raw = readRaw(storage);
  if (!raw) return { ok: false, reason: 'empty' };
  try {
    const migrated = migrateEnvelope(JSON.parse(raw));
    return migrated ? { ok: true, envelope: migrated } : { ok: false, reason: 'unsupported-version' };
  } catch (error) {
    return { ok: false, reason: 'corrupt-json', error: String(error?.message || error) };
  }
};

export const loadGame = (storage = defaultStorage()) => {
  const loaded = loadSaveEnvelope(storage);
  if (!loaded.ok) return loaded;
  return { ...restoreState(loaded.envelope.data), envelope: loaded.envelope };
};

export const clearSave = (storage = defaultStorage()) => ({ ok: removeRaw(storage), key: SAVE_KEY });
export const exportSave = () => serializeSave(createSave());

export const importSave = (text, storage = defaultStorage()) => {
  try {
    const envelope = migrateEnvelope(JSON.parse(String(text || '')));
    if (!envelope) return { ok: false, reason: 'unsupported-version' };
    const restored = restoreState(envelope.data);
    if (!restored.ok) return restored;
    writeRaw(JSON.stringify(envelope), storage);
    return { ok: true, envelope };
  } catch (error) {
    return { ok: false, reason: 'corrupt-import', error: String(error?.message || error) };
  }
};

export const autosaveGame = (storage = defaultStorage(), minMs = 2000) => {
  const hash = JSON.stringify(snapshotState());
  const time = nowMs();
  if (hash === lastAutosaveHash || time - lastAutosaveAt < minMs) return { ok: false, skipped: true };
  lastAutosaveHash = hash;
  lastAutosaveAt = time;
  return saveGame(storage);
};
