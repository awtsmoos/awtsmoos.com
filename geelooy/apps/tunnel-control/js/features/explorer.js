
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

export function mountExplorer(getTunnelName) {
  $("listBtn").onclick = async () => {
    jsonText("explorerOut", await callFs(getTunnelName(), {
      action: "list",
      path: $("explorerPath").value
    }));
  };

  $("treeBtn").onclick = async () => {
    jsonText("explorerOut", await callFs(getTunnelName(), {
      action: "tree",
      path: $("explorerPath").value,
      depth: $("treeDepth").value,
      limit: $("treeLimit").value
    }));
  };

  $("readBtn").onclick = async () => {
    jsonText("explorerOut", await callFs(getTunnelName(), {
      action: "read",
      path: $("explorerPath").value
    }));
  };

  $("mdBtn").onclick = async () => {
    jsonText("explorerOut", await callFs(getTunnelName(), {
      action: "md",
      path: $("explorerPath").value
    }));
  };
}
