// B"H
/**
 * @file NpcTargetRuntime.js
 * @description Friendly NPCs use a direct target-then-talk flow. First click
 * selects and highlights; the next explicit click, tap, or right-click opens
 * dialogue. Diagnostics are published for browser proof.
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
function list(olam) { return (olam?.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type)); }

function publishDiag(olam, patch = {}) {
  if (!olam) return null;
  olam.__mitzvahNpcDiag = {
    ...(olam.__mitzvahNpcDiag || {}),
    at: now(),
    friendlyCount: list(olam).length,
    targetableCount: list(olam).filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length,
    selected: nameOf(selected(olam)),
    selectedFresh: isFresh(selected(olam)),
    ...patch
  };
  globalThis.__MITZVAH_NPC_DIAG__ = () => ({
    ...(olam.__mitzvahNpcDiag || {}),
    selected: nameOf(selected(olam)),
    selectedFresh: isFresh(selected(olam)),
    friendlyCount: list(olam).length,
    targetableCount: list(olam).filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length
  });
  return olam.__mitzvahNpcDiag;
}

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
    touch: kind === "touch",
    primary: button === 0 || button === -1 || !Number.isFinite(button)
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
  toast(olam, `Targeted ${nameOf(npc)}. Click again to talk.`);
  publishDiag(olam, { lastClickedNpc:nameOf(npc), lastAction:"target", lastMeta:meta });
  setTimeout(() => {
    if (selected(olam) === npc && !isFresh(npc)) clearFriendlyNpcTarget(olam);
  }, TARGET_TTL_MS + 80);
  return true;
}

export function clearFriendlyNpcTarget(olam) {
  const cleared = clearVisualTarget(olam);
  publishDiag(olam, { lastAction:"clear" });
  return cleared;
}

export function npcInteractionDecision(npc, ctx = {}) {
  const meta = npcTargetMeta(ctx);
  const already = isNpcTargeted(npc?.olam, npc);
  if (!already) return { action:"target", meta, reason:"not-selected" };
  publishDiag(npc?.olam, { lastClickedNpc:nameOf(npc), lastAction:"talk-ready", lastMeta:meta });
  return { action:"open", meta, reason:meta.touch ? "mobile-second-tap" : meta.right ? "desktop-right-click" : "desktop-second-click" };
}

export function explainNpcWait(npc) {
  return `Click ${nameOf(npc)} again to talk.`;
}
