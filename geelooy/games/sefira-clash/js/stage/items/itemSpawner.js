import { chooseStageItem } from './itemRegistry.js';
import { chooseContestedSpawn } from './spawn/spawnPoint.js';
import { supplyPressure } from './spawn/supplyPressure.js';

/**
 * B"H
 * Stage item spawner.
 *
 * Chapter 182: concrete powerups and mythic relics now descend through a split
 * system: supply pressure decides urgency, mood bends the table, and contested
 * spawn points place the prize where fighters can actually fight over it.
 */
export function maybeSpawnStageItem(state) {
  state.stageDirector ||= {};
  const d = state.stageDirector;
  d.itemCooldown = Math.max(0, (d.itemCooldown || 0) - 1);
  if (d.itemCooldown > 0 || activeStageItems(state) >= 5) return null;
  const chance = itemChance(state);
  if (Math.random() > chance) return null;
  const item = spawnStageItem(state);
  d.itemCooldown = cooldownFor(state);
  d.itemsSpawned = (d.itemsSpawned || 0) + 1;
  d.lastItemRole = item.role;
  return item;
}

export function spawnStageItem(state) {
  const def = chooseStageItem(state);
  const spot = chooseContestedSpawn(state, 150);
  const item = { ...def, id: def.buff, stageItemId: def.id, name: def.name, x: spot.x, y: spot.y, spawnX: spot.x, spawnY: spot.y, active: true, respawn: 0, bob: Math.random() * 20, stageBorn: true, value: def.value + 35 };
  state.powerups.push(item);
  state.events.push({ type: 'narrative', x: item.x, y: item.y - 45, text: item.name, color: item.color });
  return item;
}

function itemChance(state) {
  const mood = state.stageMood || {};
  const supply = supplyPressure(state);
  return 1 / 1200 + supply.urgency / 1200 + (mood.restless || 0) / 100000 + (mood.chaos || 0) / 170000;
}

function cooldownFor(state) {
  const supply = supplyPressure(state);
  const base = 650 - Math.floor(supply.urgency * 220);
  return Math.max(360, base + Math.floor(Math.random() * 300));
}

function activeStageItems(state) {
  return (state.powerups || []).filter(p => p.active && p.stageBorn).length;
}
