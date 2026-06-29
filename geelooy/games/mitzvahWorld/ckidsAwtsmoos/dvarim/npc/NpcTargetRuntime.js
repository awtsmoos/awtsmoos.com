// B"H
/**
 * @file NpcTargetRuntime.js
 * @description
 * Chapter 632: the villager is first beheld, then addressed. Targeting reveals
 * a visible gold ring in-world without sending a missing UI element event.
 */
import {
  clearFriendlyNpcTarget as clearVisualTarget,
  clearNpcTargetVisual,
  ensureNpcTargetVisual
} from "./NpcTargetVisualRuntime.js?v=npc-visible-target-20260628-bh1";

const TARGET_TTL_MS = 15000;
const EFFECT_COLOR = "#8de8ff";

function now() { return Date.now(); }
function eventOf(ctx = {}) { return ctx.event || ctx.originalEvent || ctx; }
function nameOf(npc) { return npc?.name || npc?.options?.title || npc?.constructor?.itemName || "NPC"; }
function selected(olam) { return olam?.__selectedFriendlyNpc || null; }
function isFresh(npc) { return npc && now() - Number(npc.__targetedAt || 0) <= TARGET_TTL_MS; }
function toast(olam, text, color = EFFECT_COLOR) { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }

function kindOf(ctx = {}) {
  const event = eventOf(ctx);
  const type = String(ctx.pointerType || event?.pointerType || ctx.type || event?.type || "").toLowerCase();
  return ctx.isTouch || ctx.touches || ctx.changedTouches || /touch|tap/.test(type) ? "touch" : "mouse";
}

function buttonOf(ctx = {}) {
  const event = eventOf(ctx);
  const raw = ctx.button ?? event?.button;
  return Number.isFinite(Number(raw)) ? Number(raw) : 0;
}

function clearOldTarget(olam, npc) {
  if (olam.__selectedFriendlyNpc && olam.__selectedFriendlyNpc !== npc) {
    clearNpcTargetVisual(olam.__selectedFriendlyNpc);
  }
}

export function npcTargetMeta(ctx = {}) {
  const event = eventOf(ctx);
  const kind = kindOf(ctx);
  const button = buttonOf(ctx);
  return {
    kind,
    button,
    right: button === 2 || ctx.contextMenu === true || event?.type === "contextmenu",
    touch: kind === "touch"
  };
}

export function isNpcTargeted(olam, npc) {
  return selected(olam) === npc && isFresh(npc);
}

export function selectNpcTarget(npc, ctx = {}) {
  const olam = npc?.olam;
  if (!olam || !npc) return false;
  clearOldTarget(olam, npc);
  olam.__selectedFriendlyNpc = npc;
  npc.__targetedAt = now();
  const meta = npcTargetMeta(ctx);
  ensureNpcTargetVisual(npc, meta);
  const suffix = meta.touch ? "Tap again when close to talk." : "Right-click when close to talk.";
  toast(olam, `Targeted ${nameOf(npc)}. ${suffix}`);
  setTimeout(() => {
    if (selected(olam) === npc && !isFresh(npc)) clearFriendlyNpcTarget(olam);
  }, TARGET_TTL_MS + 80);
  return true;
}

export function clearFriendlyNpcTarget(olam) {
  return clearVisualTarget(olam);
}

export function npcInteractionDecision(npc, ctx = {}) {
  const meta = npcTargetMeta(ctx);
  const already = isNpcTargeted(npc?.olam, npc);
  if (!already) return { action: "target", meta, reason: "not-selected" };
  if (meta.touch || meta.right) {
    return { action: "open", meta, reason: meta.touch ? "mobile-second-tap" : "desktop-right-click" };
  }
  return { action: "wait", meta, reason: "desktop-left-click-after-target" };
}

export function explainNpcWait(npc, ctx = {}) {
  const meta = npcTargetMeta(ctx);
  const label = nameOf(npc);
  return meta.touch ? `Tap ${label} again to talk.` : `Right-click ${label} to talk.`;
}
