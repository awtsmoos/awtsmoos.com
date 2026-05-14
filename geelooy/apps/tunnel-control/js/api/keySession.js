
// B"H

import { readLocalSetting, saveLocalSetting } from "../state/storage.js";

const ACTIVE_KEY = "activeApiKey";
const SAVED_KEYS = "savedRawApiKeys";

/**
 * B"H
 * Saves raw API keys only in this browser's IndexedDB/localStorage fallback.
 * The server stores only a hash, so this browser copy is what lets the user
 * see/copy the key later on this same machine.
 */
export async function saveRawApiKey(keyRecord, rawKey) {
  const all = await readLocalSetting(SAVED_KEYS, []);

  const next = [
    {
      keyId: keyRecord.keyId,
      name: keyRecord.name,
      userId: keyRecord.userId,
      scopes: keyRecord.scopes,
      apiKey: rawKey,
      createdAt: keyRecord.createdAt
    },
    ...all.filter(k => k.keyId !== keyRecord.keyId)
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

export async function authHeaders() {
  const apiKey = await getActiveApiKey();

  if (!apiKey) {
    return {};
  }

  return {
    "x-awtsmoos-api-key": apiKey
  };
}
