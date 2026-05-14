
// B"H

import { $, jsonText } from "../lib/dom.js";
import { apiKeys, createApiKey } from "../api/control.js";

export function mountApiKeys() {
  $("loadKeysBtn").onclick = async () => {
    jsonText("keysBox", await apiKeys());
  };

  $("createKeyBtn").onclick = async () => {
    const got = await createApiKey({
      name: $("keyName").value,
      scopes: $("keyScopes").value
    });

    jsonText("keysBox", got);
  };
}
