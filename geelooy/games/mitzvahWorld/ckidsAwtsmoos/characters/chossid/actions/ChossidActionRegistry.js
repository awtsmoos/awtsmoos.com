// B"H
import { IdleActionSpec, createIdleAction } from "./IdleAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { WalkActionSpec, createWalkAction } from "./WalkAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { RunActionSpec, createRunAction } from "./RunAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { TalkHandsActionSpec, createTalkHandsAction } from "./TalkHandsAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { PunchActionSpec, createPunchAction } from "./PunchAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { CastActionSpec, createCastAction } from "./CastAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { CastStormActionSpec, createCastStormAction } from "./CastStormAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { MeleeSlashActionSpec, createMeleeSlashAction } from "./MeleeSlashAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { BowShootActionSpec, createBowShootAction } from "./BowShootAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { PickupActionSpec, createPickupAction } from "./PickupAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { LootActionSpec, createLootAction } from "./LootAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { OpenDoorActionSpec, createOpenDoorAction } from "./OpenDoorAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { WaveActionSpec, createWaveAction } from "./WaveAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { AcceptQuestActionSpec, createAcceptQuestAction } from "./AcceptQuestAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { GiveItemActionSpec, createGiveItemAction } from "./GiveItemAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { CANONICAL_ACTIONS, normalizePlatformActionName, platformActionNames } from "../../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const CHOSSID_ACTION_SPECS = Object.freeze({
  idle:IdleActionSpec,
  walk:WalkActionSpec,
  run:RunActionSpec,
  talkHands:TalkHandsActionSpec,
  punch:PunchActionSpec,
  cast:CastActionSpec,
  castStorm:CastStormActionSpec,
  meleeSlash:MeleeSlashActionSpec,
  bowShoot:BowShootActionSpec,
  pickup:PickupActionSpec,
  loot:LootActionSpec,
  openDoor:OpenDoorActionSpec,
  wave:WaveActionSpec,
  acceptQuest:AcceptQuestActionSpec,
  giveItem:GiveItemActionSpec
});

export const CHOSSID_ACTION_FACTORIES = Object.freeze({
  idle:createIdleAction,
  walk:createWalkAction,
  run:createRunAction,
  talkHands:createTalkHandsAction,
  punch:createPunchAction,
  cast:createCastAction,
  castStorm:createCastStormAction,
  meleeSlash:createMeleeSlashAction,
  bowShoot:createBowShootAction,
  pickup:createPickupAction,
  loot:createLootAction,
  openDoor:createOpenDoorAction,
  wave:createWaveAction,
  acceptQuest:createAcceptQuestAction,
  giveItem:createGiveItemAction
});

export function listChossidActions() {
  return platformActionNames();
}

export function createChossidActionClipByName(THREE, name, bones) {
  const action = normalizePlatformActionName(name);
  const factory = CHOSSID_ACTION_FACTORIES[action] || CHOSSID_ACTION_FACTORIES[name];
  if (!factory) return createGenericChossidActionClip(THREE, action, bones);
  return factory(THREE, bones);
}

export function createGenericChossidActionClip(THREE, name, bones) {
  const action = normalizePlatformActionName(name);
  const spec = CANONICAL_ACTIONS[action] || CANONICAL_ACTIONS.idle;
  const amp = spec.group === "combat" ? .55 : spec.group === "social" ? .4 : spec.group === "interaction" ? .32 : .22;
  const rotations = [
    { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:spec.duration * .5, r:[-.05, amp * .25, 0] }, { t:spec.duration, r:[0, 0, 0] }] },
    { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:spec.duration * .5, r:[amp * .18, spec.group === "combat" ? amp * .45 : 0, 0] }, { t:spec.duration, r:[0, 0, 0] }] },
    { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:spec.duration * .5, r:[.25 + amp, -.18, -.35 - amp * .45] }, { t:spec.duration, r:[.25, 0, -.35] }] },
    { bone:"leftArm", keys:[{ t:0, r:[.25, 0, .35] }, { t:spec.duration * .5, r:[.25 + amp * .8, .18, .35 + amp * .45] }, { t:spec.duration, r:[.25, 0, .35] }] }
  ];
  if (spec.rootMotion) rotations.push({ bone:"hips", keys:[{ t:0, r:[0, 0, 0] }, { t:spec.duration * .5, r:[0, amp * .08, 0] }, { t:spec.duration, r:[0, 0, 0] }] });
  return createChossidActionClip(THREE, buildActionSpec(action, spec.duration, rotations, [], { generated:true, group:spec.group }), bones);
}

export default { CHOSSID_ACTION_SPECS, CHOSSID_ACTION_FACTORIES, listChossidActions, createChossidActionClipByName, createGenericChossidActionClip };
