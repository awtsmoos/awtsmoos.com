
// B"H

import { $, jsonText } from "../lib/dom.js";
import { apiKeys, createApiKey } from "../api/control.js";
import {
  clearActiveApiKey,
  getActiveApiKey,
  getSavedRawApiKeys,
  saveRawApiKey,
  setActiveApiKey
} from "../api/keySession.js";
import { log } from "../logger.js";

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

function setKeyPill(active) {
  const pill = $("apiKeyPill");
  pill.classList.toggle("connected", !!active);
  pill.classList.toggle("warning", !active);
  $("apiKeyText").textContent = active ? "API key active" : "No API key selected";
  $("miniKey").textContent = active ? "Active" : "None";
  $("explorerNotice").textContent = active
    ? "API key active. File actions are enabled."
    : "Create, paste, or select an API key first. File actions are locked.";
}

async function renderSavedKeys(serverResult = null) {
  const saved = await getSavedRawApiKeys();
  const active = await getActiveApiKey();
  const list = $("savedKeysList");

  setKeyPill(active);

  $("activeKeyCard").textContent = active
    ? "Active key: " + maskKey(active)
    : "No active key selected.";

  list.innerHTML = "";

  if (!saved.length) {
    list.innerHTML = '<div class="notice">No saved local keys yet. Create one or paste one above.</div>';
  }

  for (const key of saved) {
    const card = document.createElement("div");
    card.className = "saved-key-card" + (key.apiKey === active ? " active" : "");

    card.innerHTML = [
      "<h4>" + key.name + "</h4>",
      "<div class='muted-line'>User: " + key.userId + "</div>",
      "<div class='muted-line'>Scopes: " + (key.scopes || []).join(" ") + "</div>",
      "<code>" + key.apiKey + "</code>",
      "<div class='saved-key-actions'>",
      "<button class='button small use-key'>Use</button>",
      "<button class='button small copy-key'>Copy</button>",
      "</div>"
    ].join("");

    card.querySelector(".use-key").onclick = async () => {
      await setActiveApiKey(key.apiKey);
      await renderSavedKeys(serverResult);
    };

    card.querySelector(".copy-key").onclick = async () => {
      await navigator.clipboard.writeText(key.apiKey);
    };

    list.appendChild(card);
  }

  if (serverResult) {
    jsonText("keysBox", serverResult);
  }
}

export async function refreshKeyUi() {
  await renderSavedKeys();
}

export async function mountApiKeys() {
  log("mountApiKeys");

  $("loadKeysBtn").onclick = async () => {
    const got = await apiKeys();
    await renderSavedKeys(got);
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
      await renderSavedKeys(got);
      $("keysBox").textContent = [
        "COPY THIS API KEY NOW:",
        "",
        got.apiKey,
        "",
        "It was saved locally in this browser and set as active.",
        "Key name: " + got.key.name,
        "Scopes: " + got.key.scopes.join(" ")
      ].join("\n");
      return;
    }

    jsonText("keysBox", got);
  };

  $("savePastedKeyBtn").onclick = async () => {
    const raw = $("pasteApiKey").value.trim();

    if (!raw) {
      $("activeKeyCard").textContent = "Paste an API key first.";
      return;
    }

    await saveRawApiKey({
      keyId: "pasted_" + Date.now(),
      name: "Pasted API Key",
      userId: "local",
      scopes: ["unknown"]
    }, raw);

    $("pasteApiKey").value = "";
    await renderSavedKeys();
  };

  $("clearActiveKeyBtn").onclick = async () => {
    await clearActiveApiKey();
    await renderSavedKeys();
  };

  await renderSavedKeys();
}
