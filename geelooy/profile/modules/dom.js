// B"H
/**
 * @module ProfileDom
 * @description
 * Chapter 19: The Awtsmoos lets the profile page speak through small DOM
 * vessels. This module owns selector safety, text purification, status speech,
 * and stat updates. It does not fetch, route, or mutate profile data.
 *
 * @responsibilities Query known profile nodes, sanitize display text, and
 * announce async states.
 * @failureModes Missing nodes return null or no-op instead of throwing during
 * progressive enhancement.
 * @sideEffects Writes textContent into existing DOM nodes.
 */

export function one(selector, root = document) {
  return root.querySelector(selector);
}

export function all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };

function decodeEntitiesOnce(text) {
  return text.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, named, dec, hex) => {
    if (named) return NAMED_ENTITIES[named];
    const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match;
  });
}

/**
 * B"H 2026-11-19 (social polish round 2): same law as the server
 * cleanText and the scripts/ profile twin fixed in round 1 — decode
 * entities once, strip whole tags, keep the plain text. This
 * dashboard copy still deleted only "<" and ">", so stored alias
 * descriptions rendered with tag residue on the Aliases tab:
 * '<a href="https://awtsmoos.com">Awtsmoos</a>' showed as
 * 'a href="https://awtsmoos.com"Awtsmoos/a' (@main) and
 * '<b>Yay</b>!' as 'bYay/b!' (@welcomeToTheCenter). The stored
 * values are proper HTML; only this render-time cleaner was wrong.
 */
export function cleanText(value, fallback = "") {
  return decodeEntitiesOnce(String(value ?? fallback))
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .trim();
}

export function setStat(name, value) {
  const el = one(`[data-profile-stat="${name}"]`);
  if (el) el.textContent = value;
}

export function profileStatus() {
  return one("[data-profile-status]");
}

export function announceProfile(message, tone = "info") {
  const el = profileStatus();
  if (!el) return;
  el.textContent = message;
  el.dataset.profileStatus = tone;
}

export function clearNode(node) {
  if (node) node.replaceChildren();
}

export function replaceWith(node, ...children) {
  if (node) node.replaceChildren(...children.filter(Boolean));
}
