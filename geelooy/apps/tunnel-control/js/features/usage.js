
// B"H

import { $, jsonText } from "../lib/dom.js";
import { usage } from "../api/control.js";

function percent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(value || 0) / Number(max)) * 100)));
}

function tile(label, value, max) {
  const p = max ? percent(value, max) : 0;

  return [
    '<div class="usage-tile">',
    '<span>' + label + '</span>',
    '<strong>' + value + (max ? " / " + max : "") + '</strong>',
    max ? '<div class="meter"><div class="meter-bar" style="--p:' + p + '%"></div></div>' : '',
    '</div>'
  ].join("");
}

function renderNice(got) {
  const u = got.usage || got || {};
  const totalRequests = u.totalRequests || u.total || 0;
  const todayRequests = u.todayRequests || 0;
  const todayBytes = u.todayBytes || 0;
  const recentRows = (u.last || u.recent || []).length || 0;

  const reqLimit = u.rateLimitPerMinute || 60;
  const byteLimit = u.bytesPerDay || 50000000;

  $("usageNice").innerHTML = [
    tile("Total requests", totalRequests),
    tile("Today requests", todayRequests, reqLimit * 1440),
    tile("Today bytes", todayBytes, byteLimit),
    tile("Recent rows", recentRows),
    '<div class="buy-tokens-card">',
    '<h3>Need more usage?</h3>',
    '<p>Token buying and larger daily transfer packages will appear here. Placeholder for now.</p>',
    '<button class="button primary" disabled>Buy tokens soon</button>',
    '</div>'
  ].join("");
}

export function mountUsage() {
  document.getElementById("loadUsageBtn").onclick = async () => {
    $("usageNice").innerHTML = '<div class="usage-tile"><span>Loading</span><strong>...</strong><div class="meter"><div class="meter-bar" style="--p:55%"></div></div></div>';
    const got = await usage();
    jsonText("usageBox", got);
    renderNice(got);
  };
}
