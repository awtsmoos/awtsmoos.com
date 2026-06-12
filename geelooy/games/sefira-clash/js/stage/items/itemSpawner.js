import { chooseStageItem } from './itemRegistry.js';
import { chooseContestedSpawn } from './spawn/spawnPoint.js';
import { supplyPressure } from './spawn/supplyPressure.js';
import { setResourcePing } from '../../ai/advanced/strategy/resourcePing.js';

/**
 * B"H
 * Deterministic contested stage item spawner with resource pings.
 *
 * Chapter 85: the relic appears and the arena rings. Bots receive a bell, the
 * story receives a beat, and the object becomes a fight instead of scenery.
 */
export function maybeSpawnStageItem(state) {
  state.stageDirector ||= {};
  const d = state.stageDirector;
  d.itemCooldown = Math.max(0, (d.itemCooldown || 0) - 1);
  if (d.itemCooldown > 0 || activeStageItems(state) >= 4) return null;
  const item = spawnStageItem(state);
  d.itemCooldown = cooldownFor(state);
  d.itemsSpawned = (d.itemsSpawned || 0) + 1;
  d.lastItemRole = item.role;
  setResourcePing(state, 'item', item.x, item.y, 165);
  return item;
}

export function spawnStageItem(state) {
  const def = chooseStageItem(state);
  const spot = chooseContestedSpawn(state, 72);
  const item = { ...def, id: def.buff, stageItemId: def.id, name: def.name, x: spot.x, y: spot.y, spawnX: spot.x, spawnY: spot.y, active: true, respawn: 0, bob: Math.random() * 20, age: 0, stageBorn: true, value: def.value + 65 };
  state.powerups.push(item);
  state.events.push({ type: 'narrative', x: item.x, y: item.y - 45, text: `Relic: ${item.name}`, color: item.color, storyBeat: 'relicSpawn' });
  return item;
}

function cooldownFor(state) {
  const supply = supplyPressure(state);
  const mood = state.stageMood || {};
  const base = 500 - Math.floor(supply.urgency * 190) - Math.floor((mood.restless || 0) * 2.2);
  return Math.max(270, base);
}

function activeStageItems(state) { return (state.powerups || []).filter(p => p.active && p.stageBorn).length; }
