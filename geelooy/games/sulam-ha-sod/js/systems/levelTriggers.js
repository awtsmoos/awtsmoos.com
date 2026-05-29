// B"H
const NON_SOLID = new Set(['ghostSpike', 'falseSpike', 'phantom']);
const HAZARDS = new Set(['ghostSpike', 'falseSpike', 'commitSpike']);
const MIN_TRIGGER_WARNING = 0.95;
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const clone = value => JSON.parse(JSON.stringify(value));

/**
 * Chapter 6: The Awtsmoos made triggered laws speak before they struck.
 *
 * Triggered spikes used to enter the oracle as instant active damage. Now every
 * spawned spike is prepared as a warning first. The trap can still be cruel, but
 * it must be readable, dodgeable, and re-created in the open air of justice.
 */
export class LevelTriggerField {
  /** @param {Array<object>} triggers Invisible law regions. */
  constructor(triggers = []) { this.triggers = triggers.map((trigger, index) => ({ ...trigger, id: index, done: false })); }
  /** @param {object} world Mutable PhysicsWorld vessel. @returns {void} */
  step(world) { for (const trigger of this.triggers) { if (trigger.once !== false && trigger.done) continue; if (!hit(world.player, trigger)) continue; trigger.done = true; applyTrigger(world, trigger); } }
  /** @returns {number} Activated trigger count. */
  activated() { return this.triggers.filter(trigger => trigger.done).length; }
}

/** @param {object} world Mutable PhysicsWorld vessel. @param {object} trigger Trigger payload. @returns {void} */
export function applyTrigger(world, trigger) {
  if (trigger.message) world.message = trigger.message;
  if (trigger.shefa) world.currency.shefa = Math.max(0, (world.currency.shefa || 0) + trigger.shefa);
  if (trigger.platforms) world.level.platforms.push(...clone(trigger.platforms));
  if (trigger.rotatingPlatforms) pushRotors(world, trigger.rotatingPlatforms);
  if (trigger.trickPlatforms) pushTricks(world, trigger.trickPlatforms);
  if (trigger.spikes) pushSpikes(world, trigger.spikes);
  if (trigger.enemies) world.enemies.push(...clone(trigger.enemies));
  if (trigger.coins) world.coins.push(...clone(trigger.coins));
  if (trigger.fakeCoins) world.fakeCoins.push(...clone(trigger.fakeCoins));
  if (trigger.trickCoins) world.trickCoins.coins.push(...clone(trigger.trickCoins));
  if (trigger.keys) world.keys.push(...clone(trigger.keys));
  if (trigger.moveDoor) Object.assign(world.level.door, trigger.moveDoor);
  if (trigger.openExit) world.keyCount = Math.max(world.keyCount, 1);
  world.reindex?.();
}

/** @param {object} world Mutable world. @param {Array<object>} rotors Rotor payloads. */
function pushRotors(world, rotors) {
  const start = world.rotors.platforms.length;
  world.rotors.platforms.push(...clone(rotors).map((p, i) => ({ ...p, id: start + i, angle: 0, phase: p.phase || i * 0.7 })));
}

/** @param {object} world Mutable world. @param {Array<object>} tricks Trick payloads. */
function pushTricks(world, tricks) {
  const start = world.tricks.platforms.length;
  world.tricks.platforms.push(...clone(tricks).map((p, i) => ({ ...p, id: start + i, warn: p.kind, baseX: p.x, baseY: p.y, t: 0, broken: 0, cooldown: p.delay || 0, armed: true, alpha: 1, shifted: false, solid: !NON_SOLID.has(p.kind), hazardous: HAZARDS.has(p.kind) })));
}

/** @param {object} world Mutable world. @param {Array<object>} spikes Spike payloads. */
function pushSpikes(world, spikes) {
  const start = world.spikes.traps.length;
  const prepared = clone(spikes).map((spike, i) => {
    const raw = { ...spike, id: start + i, instant: false, showDormant: spike.showDormant !== false, warning: Math.max(Number(spike.warning ?? MIN_TRIGGER_WARNING), MIN_TRIGGER_WARNING), warn: Math.max(Number(spike.warning ?? MIN_TRIGGER_WARNING), MIN_TRIGGER_WARNING), active: 0 };
    return world.spikes.prepareTrap ? world.spikes.prepareTrap(raw, start + i) : raw;
  });
  world.spikes.traps.push(...prepared);
}
