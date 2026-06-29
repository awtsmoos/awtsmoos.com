// B"H
/**
 * @file NpcTargetRuntime.js
 * @description
 * Chapter 620: The villager is not a vending machine; he is first beheld.
 *
 * In the meadow of rendered speech, the Awtsmoos teaches restraint: a click may
 * identify a soul from far away, but dialogue descends only through intention.
 * Desktop intention is the right hand of the mouse. Mobile intention is the
 * second tap after the target ring has already remembered the NPC.
 */
const TARGET_TTL_MS = 15000;
const EFFECT_COLOR = "#8de8ff";

function now() { return Date.now(); }
function eventOf(ctx = {}) { return ctx.event || ctx.originalEvent || ctx; }
function kindOf(ctx = {}) {
  const e = eventOf(ctx);
  const t = String(ctx.pointerType || e?.pointerType || ctx.type || e?.type || "").toLowerCase();
  if (ctx.isTouch || ctx.touches || ctx.changedTouches || /touch|tap/.test(t)) return "touch";
  return "mouse";
}
function buttonOf(ctx = {}) {
  const e = eventOf(ctx);
  const raw = ctx.button ?? e?.button;
  return Number.isFinite(Number(raw)) ? Number(raw) : 0;
}
function nameOf(npc) { return npc?.name || npc?.options?.title || npc?.constructor?.itemName || "NPC"; }
function selected(olam) { return olam?.__selectedFriendlyNpc || null; }
function isFresh(npc) { return npc && now() - Number(npc.__targetedAt || 0) <= TARGET_TTL_MS; }
function toast(olam, text, color = EFFECT_COLOR) { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color }); }
export function npcTargetMeta(ctx = {}) {
  const e = eventOf(ctx), kind = kindOf(ctx), button = buttonOf(ctx);
  return { kind, button, right:button === 2 || ctx.contextMenu === true || e?.type === "contextmenu", touch:kind === "touch" };
}
export function isNpcTargeted(olam, npc) { return selected(olam) === npc && isFresh(npc); }
export function selectNpcTarget(npc, ctx = {}) {
  const olam = npc?.olam;
  if (!olam || !npc) return false;
  olam.__selectedFriendlyNpc = npc;
  npc.__targetedAt = now();
  const meta = npcTargetMeta(ctx);
  const suffix = meta.touch ? "Tap again when close to talk." : "Right-click when close to talk.";
  toast(olam, `Targeted ${nameOf(npc)}. ${suffix}`);
  olam.ayshPeula?.("ui event", "friendlyNpcTarget", { npcName:nameOf(npc), entityId:npc.id || nameOf(npc), touch:meta.touch });
  return true;
}
export function npcInteractionDecision(npc, ctx = {}) {
  const meta = npcTargetMeta(ctx), already = isNpcTargeted(npc?.olam, npc);
  if (!already) return { action:"target", meta, reason:"not-selected" };
  if (meta.touch || meta.right) return { action:"open", meta, reason:meta.touch ? "mobile-second-tap" : "desktop-right-click" };
  return { action:"wait", meta, reason:"desktop-left-click-after-target" };
}
export function explainNpcWait(npc, ctx = {}) {
  const meta = npcTargetMeta(ctx), label = nameOf(npc);
  return meta.touch ? `Tap ${label} again to talk.` : `Right-click ${label} to talk.`;
}
