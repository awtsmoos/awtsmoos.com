
// B"H

import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const ACTIVE_KEY = "activeApiKey";
const SAVED_KEYS = "savedRawApiKeys";

function idForRaw(rawKey) {
  return "local_" + String(rawKey || "").slice(0, 10) + "_" + String(rawKey || "").slice(-6);
}

export async function saveRawApiKey(keyRecord, rawKey) {
  const all = await readLocalSetting(SAVED_KEYS, []);

  const record = {
    keyId: keyRecord?.keyId || idForRaw(rawKey),
    name: keyRecord?.name || "Pasted API Key",
    userId: keyRecord?.userId || "local",
    scopes: keyRecord?.scopes || [],
    apiKey: rawKey,
    createdAt: keyRecord?.createdAt || Date.now()
  };

  const next = [
    record,
    ...all.filter(k => k.keyId !== record.keyId && k.apiKey !== rawKey)
  ];

  await saveLocalSetting(SAVED_KEYS, next);
  await saveLocalSetting(ACTIVE_KEY, rawKey);

  return next;
}

export async function getSavedRawApiKeys() {
  return await readLocalSetting(SAVED_KEYS, []);
}

export async function setActiveApiKey(rawKey) {
  await saveLocalSetting(ACTIVE_KEY, rawKey || "");
}

export async function getActiveApiKey() {
  return await readLocalSetting(ACTIVE_KEY, "");
}

export async function clearActiveApiKey() {
  await saveLocalSetting(ACTIVE_KEY, "");
}

export async function authHeaders() {
  const apiKey = await getActiveApiKey();

  if (!apiKey) {
    return {};
  }

  return {
    "x-awtsmoos-api-key": apiKey
  };
}
