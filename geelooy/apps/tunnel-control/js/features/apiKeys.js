
// B"H

import { $, jsonText } from "../lib/dom.js";
import { apiKeys, createApiKey } from "../api/control.js";

function selectedScopes() {
  return [...document.querySelectorAll(".scopeBox")]
    .filter(x => x.checked)
    .map(x => x.value)
    .join(" ");
}

export function mountApiKeys() {
  $("loadKeysBtn").onclick = async () => {
    jsonText("keysBox", await apiKeys());
  };

  $("createKeyBtn").onclick = async () => {
    const got = await createApiKey({
      name: $("keyName").value,
      scopes: selectedScopes(),
      rateLimitPerMinute: $("keyRate").value,
      bytesPerDay: $("keyBytes").value
    });

    jsonText("keysBox", got);
  };
}
