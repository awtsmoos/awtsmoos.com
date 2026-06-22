// B"H
/** @file ScrollToastQueue.js @description Low-churn parchment toast queue for shlichus notices. */
const TTL = 4200;
function el(id) { return document.getElementById(id); }
function ensureStack() { let stack = el("scrollToastStack"); if (!stack) { stack = document.createElement("div"); stack.id = "scrollToastStack"; document.body.appendChild(stack); } return stack; }
export function scrollToast(text, ttl = TTL) { const stack = ensureStack(); const node = document.createElement("div"); node.className = "scrollToast"; node.textContent = String(text || "Shlichus updated."); stack.appendChild(node); setTimeout(() => node.remove(), ttl); return node; }
export function clearScrollToasts() { el("scrollToastStack")?.replaceChildren(); }
export default { scrollToast, clearScrollToasts };
