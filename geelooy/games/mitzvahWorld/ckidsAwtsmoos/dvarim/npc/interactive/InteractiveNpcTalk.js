// B"H
/**
 * @file InteractiveNpcTalk.js
 * @description Target-first speech. First click selects, second click/tap or
 * right-click opens the existing NPC overlay and records browser diagnostics.
 */
import { positionOf } from "./InteractiveNpcGeometry.js?compact=true&v=npc-split-20260628-bh1";
import { npcOverlayPayload } from "./InteractiveNpcPayload.js?compact=true&v=npc-split-20260628-bh1";
import { holdUi, releaseUi, stopPointer } from "./InteractiveNpcUiHold.js?compact=true&v=npc-split-20260628-bh1";
import {
  explainNpcWait,
  npcInteractionDecision,
  selectNpcTarget
} from "../NpcTargetRuntime.js?compact=true&v=full-revamp-npc-target-talk-20260704-bh1";

const EXPLICIT_TYPES = new Set(["pointerdown", "pointerup", "click", "touchend", "mousedown", "mouseup", "contextmenu"]);

export function isExplicitInteraction(actor) {
  const type = actor?.type || actor?.event?.type || actor?.originalEvent?.type;
  return EXPLICIT_TYPES.has(type) || actor?.explicit === true || actor?.isPointer === true || actor?.isTap === true;
}

export function findTalker(npc, actor) {
  return actor?.player || (positionOf(actor) ? actor : null) || npc.olam?.chossid || npc.olam?.player || null;
}

export function faceTalker(npc, actor) {
  const playerPosition = positionOf(actor);
  const npcPosition = positionOf(npc);
  if (!playerPosition || !npcPosition || !npc.mesh) return;
  const dx = playerPosition.x - npcPosition.x;
  const dz = playerPosition.z - npcPosition.z;
  if (Math.abs(dx) + Math.abs(dz) > 0.001) npc.mesh.rotation.y = Math.atan2(dx, dz);
}

function tooFar(npc, talker) {
  const a = positionOf(talker);
  const b = positionOf(npc);
  return Boolean(a && b && a.distanceTo?.(b) > npc.talkDistance);
}

function warnTooFar(npc) {
  npc.olam.showingImportantMessage = false;
  npc.olam?.ayshPeula?.("ui event", "toast", { message:`B"H - Move closer to ${npc.name} to talk.`, type:"info" });
  npc.olam.__mitzvahNpcDiag = { ...(npc.olam.__mitzvahNpcDiag || {}), lastDialogueEvent:"too-far", lastClickedNpc:npc.name, at:Date.now() };
}

function recordDialogue(npc, payload) {
  npc.olam.__mitzvahNpcDiag = {
    ...(npc.olam.__mitzvahNpcDiag || {}),
    at: Date.now(),
    lastClickedNpc: npc.name,
    lastDialogueEvent: "openNpcChallengeOverlay",
    lastDialoguePayload: {
      name: payload?.name || payload?.npcName || npc.name,
      options: Array.isArray(payload?.options) ? payload.options.length : 0,
      hasShop: Boolean(payload?.hasShop),
      opensLevelSelect: Boolean(payload?.opensLevelSelect)
    }
  };
}

export function openGuideMenu(npc, actor, explicitOpen = false) {
  if (!explicitOpen && !isExplicitInteraction(actor)) return false;
  stopPointer(actor);
  const talker = findTalker(npc, actor);
  if (tooFar(npc, talker)) {
    warnTooFar(npc);
    return false;
  }
  holdUi(npc.olam);
  npc.olam.__selectedFriendlyNpc = npc;
  faceTalker(npc, talker);
  const payload = npcOverlayPayload(npc, talker);
  recordDialogue(npc, payload);
  npc.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", payload);
  setTimeout(() => releaseUi(npc.olam), 980);
  return true;
}

export function handleNpcExplicitTap(npc, actor) {
  const stamp = Date.now();
  if (stamp - npc.__lastTapEventAt < 140) return false;
  npc.__lastTapEventAt = stamp;
  const decision = npcInteractionDecision(npc, actor);
  if (decision.action === "target") {
    selectNpcTarget(npc, actor);
    return "selected";
  }
  if (decision.action === "wait") {
    npc.olam?.ayshPeula?.("ui event", "effectsOverlay", { text:explainNpcWait(npc, actor), color:"#ffd95a" });
    return "selected";
  }
  return openGuideMenu(npc, actor, true);
}
