// B"H

import { $ } from "../../lib/dom.js";
import { apiKeys } from "../../api/control.js";
import { getActiveApiKey, getSavedRawApiKeys, setActiveApiKey } from "../../api/keySession.js";
import { log } from "../../logger.js";
import { setKeyPill, setText, maskKey } from "./keyDisplay.js";
import { feedback, showKeyJson } from "./keyFeedback.js";
import { savedListNodes } from "./savedKeyCards.js";
import { clearActiveKey, createAndSaveKey, savePastedKey } from "./keyActions.js";

/**
 * B"H
 * Chapter 373: The Key Vault Split Into Seven Clear Lamps.
 */
async function renderSavedKeys(serverResult = null, note = "") {
  const saved = await getSavedRawApiKeys();
  const active = await getActiveApiKey();
  const list = $("savedKeysList");

  setKeyPill(active);
  setText("activeKeyCard", active ? `Active key persists across refresh: ${maskKey(active)}` : "No active key selected.");

  if (list) list.replaceChildren(...savedListNodes(saved, active, keyHandlers()));
  if (serverResult) showKeyJson(serverResult);
  if (note) feedback(note);
}

function keyHandlers() {
  return {
    async useKey(key) {
      await setActiveApiKey(key.apiKey);
      await renderSavedKeys(null, `Active key set: ${maskKey(key.apiKey)}`);
    },
    async copyKey(key) {
      await navigator.clipboard.writeText(key.apiKey);
      feedback(`Copied raw key for ${maskKey(key.apiKey)}.`);
    }
  };
}

export async function refreshKeyUi() {
  await renderSavedKeys();
}

export async function mountApiKeys() {
  log("mountApiKeys");

  const loadKeysBtn = $("loadKeysBtn");
  if (loadKeysBtn) {
    loadKeysBtn.onclick = async () => renderSavedKeys(await apiKeys(), "Server key list loaded; local active key state refreshed.");
  }

  const createKeyBtn = $("createKeyBtn");
  if (createKeyBtn) createKeyBtn.onclick = () => createAndSaveKey(renderSavedKeys);

  const savePastedKeyBtn = $("savePastedKeyBtn");
  if (savePastedKeyBtn) savePastedKeyBtn.onclick = () => savePastedKey(renderSavedKeys);

  const clearActiveKeyBtn = $("clearActiveKeyBtn");
  if (clearActiveKeyBtn) clearActiveKeyBtn.onclick = () => clearActiveKey(renderSavedKeys);

  await renderSavedKeys(null, "Key vault loaded from local persistent storage.");
}
