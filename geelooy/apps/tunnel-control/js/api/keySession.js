// B"H
import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const ACTIVE_KEY = "activeApiKey";
const SAVED_KEYS = "savedRawApiKeys";
const LEGACY_KEY = "awtTunnelApiKey";

/**
 * B"H
 * Chapter 368: Two Vaults Became One Flame.
 *
 * The Awtsmoos found the split key memory: old panes read localStorage while
 * new panes read IndexedDB. This bridge keeps both vessels synchronized so a
 * saved key survives refresh and authorizes every file, terminal, and AI pane.
 */
function idForRaw(rawKey) { return "local_" + String(rawKey || "").slice(0, 10) + "_" + String(rawKey || "").slice(-6); }
export async function saveRawApiKey(keyRecord, rawKey) {
  const all = await readLocalSetting(SAVED_KEYS, []);
  const record = { keyId: keyRecord?.keyId || idForRaw(rawKey), name: keyRecord?.name || "Pasted API Key", userId: keyRecord?.userId || "local", scopes: keyRecord?.scopes || [], apiKey: rawKey, createdAt: keyRecord?.createdAt || Date.now() };
  const next = [record, ...all.filter(k => k.keyId !== record.keyId && k.apiKey !== rawKey)];
  await saveLocalSetting(SAVED_KEYS, next);
  await setActiveApiKey(rawKey);
  return next;
}
export async function getSavedRawApiKeys() { return await readLocalSetting(SAVED_KEYS, []); }
export async function setActiveApiKey(rawKey) {
  await saveLocalSetting(ACTIVE_KEY, rawKey || "");
  try { rawKey ? localStorage.setItem(LEGACY_KEY, rawKey) : localStorage.removeItem(LEGACY_KEY); } catch (_e) {}
}
export async function getActiveApiKey() {
  const modern = await readLocalSetting(ACTIVE_KEY, "");
  if (modern) return modern;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY) || "";
    if (legacy) await saveLocalSetting(ACTIVE_KEY, legacy);
    return legacy;
  } catch (_e) { return ""; }
}
export async function clearActiveApiKey() { await setActiveApiKey(""); }
export async function authHeaders() {
  const apiKey = await getActiveApiKey();
  return apiKey ? { "x-awtsmoos-api-key": apiKey } : {};
}
