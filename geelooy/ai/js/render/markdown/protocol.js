//B"H
import { escapeHtml } from "../escapeHtml.js";

export const PROTOCOL_TOKEN = /([^]+)/g;

export function renderProtocol(inner, raw) {
  const parts = String(inner || "").split("");
  const kind = parts[0] || "reference";
  const label = parts.filter(Boolean).slice(1).join(" / ") || kind;
  return `<span class="protocol-chip" title="${escapeHtml(raw)}">${escapeHtml(kind)}: ${escapeHtml(label)}</span>`;
}
