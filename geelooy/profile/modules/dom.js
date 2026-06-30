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

export function cleanText(value, fallback = "") {
  return String(value ?? fallback).replace(/[<>]/g, "").trim();
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
