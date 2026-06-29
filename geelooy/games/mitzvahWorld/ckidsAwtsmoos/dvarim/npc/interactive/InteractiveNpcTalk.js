// B"H
/**
 * @file InteractiveNpcTalk.js
 * @description
 * Target-first speech covenant. The Awtsmoos makes the first click a gaze, the
 * right-click or second tap a request, and nearness the gate of conversation.
 */
import { positionOf } from "./InteractiveNpcGeometry.js?v=npc-split-20260628-bh1";
import { npcOverlayPayload } from "./InteractiveNpcPayload.js?v=npc-split-20260628-bh1";
import { holdUi, releaseUi, stopPointer } from "./InteractiveNpcUiHold.js?v=npc-split-20260628-bh1";
import {
  explainNpcWait,
  npcInteractionDecision,
  selectNpcTarget
} from "../NpcTargetRuntime.js?v=npc-target-20260628-bh1";

const EXPLICIT_TYPES = new Set([
  "pointerdown",
  "pointerup",
  "click",
  "touchend",
  "mousedown",
  "mouseup",
  "contextmenu"
]);

export function isExplicitInteraction(actor) {
  const type = actor?.type || actor?.event?.type || actor?.originalEvent?.type;
  return EXPLICIT_TYPES.has(type)
    || actor?.explicit === true
    || actor?.isPointer === true
    || actor?.isTap === true;
}

export function findTalker(npc, actor) {
  return actor?.player
    || (positionOf(actor) ? actor : null)
    || npc.olam?.chossid
    || npc.olam?.player
    || null;
}

export function faceTalker(npc, actor) {
  const playerPosition = positionOf(actor);
  const npcPosition = positionOf(npc);
  if (!playerPosition || !npcPosition || !npc.mesh) return;

  const dx = playerPosition.x - npcPosition.x;
  const dz = playerPosition.z - npcPosition.z;
  if (Math.abs(dx) + Math.abs(dz) > 0.001) {
    npc.mesh.rotation.y = Math.atan2(dx, dz);
  }
}

function tooFar(npc, talker) {
  const a = positionOf(talker);
  const b = positionOf(npc);
  return Boolean(a && b && a.distanceTo?.(b) > npc.talkDistance);
}

function warnTooFar(npc) {
  npc.olam.showingImportantMessage = false;
  npc.olam?.ayshPeula?.("ui event", "toast", {
    message: `B"H - Move closer to ${npc.name} to talk.`,
    type: "info"
  });
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
  npc.olam?.ayshPeula?.("ui event", "openNpcChallengeOverlay", npcOverlayPayload(npc, talker));
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
    npc.olam?.ayshPeula?.("ui event", "effectsOverlay", {
      text: explainNpcWait(npc, actor),
      color: "#ffd95a"
    });
    return "selected";
  }

  return openGuideMenu(npc, actor, true);
}
