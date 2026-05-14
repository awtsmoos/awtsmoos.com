
// B"H

import { jsonText } from "../lib/dom.js";
import { usage } from "../api/control.js";

export function mountUsage() {
  document.getElementById("loadUsageBtn").onclick = async () => {
    jsonText("usageBox", await usage());
  };
}
