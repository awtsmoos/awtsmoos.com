
// B"H

import { $, jsonText } from "../lib/dom.js";
import { apiKeys, createApiKey } from "../api/control.js";
import {
  getActiveApiKey,
  getSavedRawApiKeys,
  saveRawApiKey,
  setActiveApiKey
} from "../api/keySession.js";

function selectedScopes() {
  return [...document.querySelectorAll(".scopeBox")]
    .filter(x => x.checked)
    .map(x => x.value)
    .join(" ");
}

function maskKey(key) {
  if (!key) return "";
  return key.slice(0, 8) + "..." + key.slice(-8);
}

async function renderFriendlyKeys(serverResult) {
  const saved = await getSavedRawApiKeys();
  const active = await getActiveApiKey();
  const box = $("keysBox");

  const keys = serverResult?.keys || [];
  const lines = [];

  lines.push("API key status:");
  lines.push(active ? "Active key selected: " + maskKey(active) : "No active API key selected.");
  lines.push("");

  if (!keys.length && !saved.length) {
    lines.push("No keys loaded yet. Create one, copy it, and it will be saved locally in this browser.");
  }

  if (keys.length) {
    lines.push("Server keys:");
    for (const k of keys) {
      const raw = saved.find(s => s.keyId === k.keyId);
      lines.push("- " + k.name + " (" + k.keyId + ")");
      lines.push("  scopes: " + (k.scopes || []).join(" "));
      lines.push("  rate: " + k.rateLimitPerMinute + "/min, bytes/day: " + k.bytesPerDay);
      lines.push("  local raw copy: " + (raw ? maskKey(raw.apiKey) : "not saved in this browser"));
    }
  }

  if (saved.length) {
    lines.push("");
    lines.push("Raw keys saved in this browser:");
    for (const s of saved) {
      lines.push("- " + s.name + " → " + s.apiKey);
    }
  }

  box.textContent = lines.join("\n");
}

export async function mountApiKeys() {
  $("loadKeysBtn").onclick = async () => {
    const got = await apiKeys();
    await renderFriendlyKeys(got);
  };

  $("createKeyBtn").onclick = async () => {
    const got = await createApiKey({
      name: $("keyName").value,
      scopes: selectedScopes(),
      rateLimitPerMinute: $("keyRate").value,
      bytesPerDay: $("keyBytes").value
    });

    if (got.ok && got.apiKey && got.key) {
      await saveRawApiKey(got.key, got.apiKey);

      $("keysBox").textContent = [
        "COPY THIS API KEY NOW:",
        "",
        got.apiKey,
        "",
        "It was also saved locally in this browser and set as the active key.",
        "Key name: " + got.key.name,
        "Scopes: " + got.key.scopes.join(" "),
        "Rate: " + got.key.rateLimitPerMinute + "/min",
        "Bytes/day: " + got.key.bytesPerDay
      ].join("\n");

      return;
    }

    jsonText("keysBox", got);
  };

  const saved = await getSavedRawApiKeys();
  const active = await getActiveApiKey();

  if (saved.length || active) {
    await renderFriendlyKeys({ ok: true, keys: [] });
  }
}

export async function ensureActiveKeyMessage() {
  const key = await getActiveApiKey();
  return key ? "" : "Create/select an API key before using the explorer or action lab.";
}
