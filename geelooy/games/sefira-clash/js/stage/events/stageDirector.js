import { updateStageMood } from './stageMood.js';
import { maybeSpawnStageItem } from '../items/itemSpawner.js';
import { maybeSpawnHazard } from '../hazards/hazardSpawner.js';
import { stepHazards } from '../hazards/hazardState.js';
import { stepBattlefieldScars } from '../scars/battlefieldScars.js';
import { stepObjectiveDirector } from '../objectives/objectiveDirector.js';

/**
 * B"H
 * Living battlefield director.
 *
 * Chapter 160: the arena now conducts four visible memories: contested relics,
 * warned hazards, fading scars, and capture runes that briefly pull the battle
 * into one sacred place.
 */
export function createStageDirector() {
  return { itemCooldown: 360, hazardCooldown: 600, objectiveCooldown: 900, itemsSpawned: 0, itemsPickedUp: 0, hazardsSpawned: 0, hazardHits: 0, objectiveSpawns: 0, objectiveClaims: 0 };
}

export function stepStageDirector(state) {
  state.stageDirector ||= createStageDirector();
  updateStageMood(state);
  maybeSpawnStageItem(state);
  maybeSpawnHazard(state);
  stepHazards(state);
  stepObjectiveDirector(state);
  stepBattlefieldScars(state);
}
