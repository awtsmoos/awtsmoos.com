// B"H
import { IdleActionSpec, createIdleAction } from "./IdleAction.js";
import { WalkActionSpec, createWalkAction } from "./WalkAction.js";
import { RunActionSpec, createRunAction } from "./RunAction.js";
import { TalkHandsActionSpec, createTalkHandsAction } from "./TalkHandsAction.js";
import { PunchActionSpec, createPunchAction } from "./PunchAction.js";
import { CastActionSpec, createCastAction } from "./CastAction.js";
import { CastStormActionSpec, createCastStormAction } from "./CastStormAction.js";
import { MeleeSlashActionSpec, createMeleeSlashAction } from "./MeleeSlashAction.js";
import { BowShootActionSpec, createBowShootAction } from "./BowShootAction.js";
import { PickupActionSpec, createPickupAction } from "./PickupAction.js";
import { LootActionSpec, createLootAction } from "./LootAction.js";
import { OpenDoorActionSpec, createOpenDoorAction } from "./OpenDoorAction.js";
import { WaveActionSpec, createWaveAction } from "./WaveAction.js";
import { AcceptQuestActionSpec, createAcceptQuestAction } from "./AcceptQuestAction.js";
import { GiveItemActionSpec, createGiveItemAction } from "./GiveItemAction.js";

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
  return Object.keys(CHOSSID_ACTION_SPECS);
}

export function createChossidActionClipByName(THREE, name, bones) {
  const factory = CHOSSID_ACTION_FACTORIES[name];
  if (!factory) throw new Error(`Unknown Chossid action: ${name}`);
  return factory(THREE, bones);
}

export default { CHOSSID_ACTION_SPECS, CHOSSID_ACTION_FACTORIES, listChossidActions, createChossidActionClipByName };
