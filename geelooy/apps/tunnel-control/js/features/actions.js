
// B"H

import { $, jsonText, text } from "../lib/dom.js";
import { callFs, buildFsUrl } from "../api/tunnel.js";

export function mountActions(getTunnelName) {
  $("runActionBtn").onclick = async () => {
    const action = $("actionName").value;
    const opts = {
      action,
      path: $("actionPath").value,
      maxChars: $("maxChars").value
    };

    if (action === "tree") {
      opts.depth = $("treeDepth").value;
      opts.limit = $("treeLimit").value;
    }

    if (action === "write") {
      opts.content = $("writeContent").value;
    }

    if (action === "bulk") {
      opts.paths = $("bulkPaths").value.split(/\r?\n/g).map(x => x.trim()).filter(Boolean);
    }

    if (action === "bulkWrite") {
      try {
        opts.files = JSON.parse($("bulkWriteJson").value);
      } catch (e) {
        text("actionOut", "Invalid bulk write JSON: " + e.message);
        return;
      }
    }

    text("actionUrlOut", buildFsUrl(getTunnelName(), opts));
    jsonText("actionOut", await callFs(getTunnelName(), opts));
  };

  $("copyActionUrlBtn").onclick = async () => {
    await navigator.clipboard.writeText($("actionUrlOut").textContent);
  };
}
