
// B"H

import { $, jsonText } from "../lib/dom.js";
import { usage } from "../api/control.js";

function tile(label, value) {
  return '<div class="usage-tile"><span>' + label + '</span><strong>' + value + '</strong></div>';
}

function renderNice(got) {
  const u = got.usage || {};

  $("usageNice").innerHTML = [
    tile("Total requests", u.totalRequests || 0),
    tile("Today requests", u.todayRequests || 0),
    tile("Today bytes", u.todayBytes || 0),
    tile("Recent rows", (u.last || []).length)
  ].join("");
}

export function mountUsage() {
  document.getElementById("loadUsageBtn").onclick = async () => {
    const got = await usage();
    jsonText("usageBox", got);
    renderNice(got);
  };
}
