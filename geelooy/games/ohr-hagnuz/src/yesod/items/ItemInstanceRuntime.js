/**
 * B"H
 * @module ItemInstanceRuntime
 * @description Instance item identity layered beside the legacy counter bag.
 *
 * Chapter 406: Loot received a private name. The Awtsmoos creates every thing
 * from nothing, but a player remembers this scale, this robe-thread, this rare
 * spark. Item instances are the bridge from counters to MMORPG memory.
 */
import { State } from '../../binah/State.js';
import { MasterItems } from '../../data/items/MasterItems.js';

const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const allowedContainers = new Set(['bag', 'storage', 'equipment', 'reward', 'world']);

export const ensureItemInstances = () => {
  State.ItemInstances ||= { seq: 0, items: {}, containers: { bag: [], storage: [], equipment: [], reward: [], world: [] } };
  State.ItemInstances.items ||= {};
  State.ItemInstances.containers ||= { bag: [], storage: [], equipment: [], reward: [], world: [] };
  for (const id of allowedContainers) State.ItemInstances.containers[id] ||= [];
  State.ItemInstances.seq ||= 0;
  return State.ItemInstances;
};

export const itemDefinition = defId => MasterItems[defId] || null;
export const nextItemInstanceId = () => `itm_${++ensureItemInstances().seq}`;

export const createItemInstance = (defId, options = {}) => {
  const def = itemDefinition(defId);
  if (!def) return { ok: false, reason: 'unknown-definition' };
  const state = ensureItemInstances();
  const container = allowedContainers.has(options.container) ? options.container : 'bag';
  const id = options.id || nextItemInstanceId();
  const item = {
    id,
    defId,
    name: options.name || def.name,
    rarity: options.rarity || 'common',
    quantity: Math.max(1, options.quantity | 0 || 1),
    source: options.source || 'unknown',
    container,
    value: options.value ?? def.value ?? 0,
    icon: options.icon || def.icon || '◇',
    desc: options.desc || def.desc || '',
    metadata: clone(options.metadata || {}),
    createdAt: options.createdAt || new Date().toISOString()
  };
  state.items[id] = item;
  state.containers[container].push(id);
  return { ok: true, item };
};

export const getItemInstance = id => ensureItemInstances().items[id] || null;

export const moveItemInstance = (id, to) => {
  const state = ensureItemInstances();
  const item = state.items[id];
  if (!item) return { ok: false, reason: 'missing-instance' };
  if (!allowedContainers.has(to)) return { ok: false, reason: 'bad-container' };
  state.containers[item.container] = (state.containers[item.container] || []).filter(x => x !== id);
  item.container = to;
  if (!state.containers[to].includes(id)) state.containers[to].push(id);
  return { ok: true, item };
};

export const destroyItemInstance = id => {
  const state = ensureItemInstances();
  const item = state.items[id];
  if (!item) return { ok: false, reason: 'missing-instance' };
  state.containers[item.container] = (state.containers[item.container] || []).filter(x => x !== id);
  delete state.items[id];
  return { ok: true, item };
};

export const itemInstancesIn = container => {
  const state = ensureItemInstances();
  return (state.containers[container] || []).map(id => state.items[id]).filter(Boolean);
};

export const itemInstanceRows = (container = 'bag') => itemInstancesIn(container).map(item => [
  `${item.icon} ${item.name}`,
  `${item.rarity} • x${item.quantity} • ${item.source}`
]);
