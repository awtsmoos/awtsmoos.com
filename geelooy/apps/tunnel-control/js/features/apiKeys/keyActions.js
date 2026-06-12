// B"H

import { $ } from "../../lib/dom.js";
import { createApiKey } from "../../api/control.js";
import { clearActiveApiKey, saveRawApiKey } from "../../api/keySession.js";
import { selectedScopes, maskKey } from "./keyDisplay.js";
import { feedback, showKeyJson } from "./keyFeedback.js";

/**
 * B"H
 * Chapter 372: Key Actions Became Rivers With Named Banks.
 */
export async function createAndSaveKey(renderSavedKeys) {
  const got = await createApiKey({
    name: $("keyName")?.value || "",
    scopes: selectedScopes(),
    rateLimitPerMinute: $("keyRate")?.value || "",
    bytesPerDay: $("keyBytes")?.value || ""
  });

  if (got.ok && got.apiKey && got.key) {
    await saveRawApiKey(got.key, got.apiKey);
    await renderSavedKeys(got, `Created, saved locally, and activated: ${maskKey(got.apiKey)}. Copy raw key from the card if needed.`);
    return;
  }

  showKeyJson(got);
}

export async function savePastedKey(renderSavedKeys) {
  const input = $("pasteApiKey");
  const raw = input?.value?.trim() || "";

  if (!raw) {
    feedback("Paste an API key first; nothing was saved.");
    return;
  }

  await saveRawApiKey({
    keyId: "pasted_" + Date.now(),
    name: "Pasted API Key",
    userId: "local",
    scopes: ["unknown"]
  }, raw);

  input.value = "";
  await renderSavedKeys(null, `Pasted key saved locally, activated, and will persist after refresh: ${maskKey(raw)}.`);
}

export async function clearActiveKey(renderSavedKeys) {
  await clearActiveApiKey();
  await renderSavedKeys(null, "Active key cleared. Saved keys remain available below.");
}
