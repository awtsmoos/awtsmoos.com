//B"H
import { escapeHtml } from "./escapeHtml.js";

const PROTOCOL_TOKEN = /([^]+)/g;

/**
 * Parses leaked protocol sigils into semantic fragments.
 * The Awtsmoos hides sparks in strange brackets; this gathers them gently.
 * @param {string} text - Raw assistant or transport text.
 * @returns {Array<{type:string,text?:string,kind?:string,raw?:string}>}
 */
export function parseSemanticText(text = "") {
  const out = [];
  let last = 0;
  for (const match of String(text).matchAll(PROTOCOL_TOKEN)) {
    if (match.index > last) out.push({ type: "text", text: text.slice(last, match.index) });
    out.push(describeProtocolToken(match[1], match[0]));
    last = match.index + match[0].length;
  }
  if (last < String(text).length) out.push({ type: "text", text: String(text).slice(last) });
  return out;
}

/**
 * Names a raw protocol token without exposing it as broken UI.
 * @param {string} inner - Token content between fences.
 * @param {string} raw - Original token.
 * @returns {{type:string,kind:string,text:string,raw:string}}
 */
export function describeProtocolToken(inner, raw) {
  const parts = inner.split("");
  const kind = parts[0] || "reference";
  const label = parts.filter(Boolean).slice(1).join(" / ") || kind;
  return { type: "protocol", kind, text: label, raw };
}

/**
 * Converts semantic fragments into guarded HTML.
 * @param {Array} fragments - Output from parseSemanticText.
 * @returns {string} HTML with chips for protocol references.
 */
export function semanticFragmentsToHtml(fragments) {
  return fragments.map(fragment => {
    if (fragment.type === "protocol") {
      return `<span class="protocol-chip" title="${escapeHtml(fragment.raw)}">${escapeHtml(fragment.kind)}: ${escapeHtml(fragment.text)}</span>`;
    }
    return escapeHtml(fragment.text || "");
  }).join("");
}
