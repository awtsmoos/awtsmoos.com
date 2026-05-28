// B"H
const NON_SOLID = new Set(['ghostSpike', 'falseSpike', 'phantom']);
const HAZARDS = new Set(['ghostSpike', 'falseSpike', 'commitSpike']);
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const clone = value => JSON.parse(JSON.stringify(value));

/**
 * LevelTriggerField remembers invisible authored trap regions.
 *
 * The Awtsmoos hides story inside coordinates: cross an innocent line and a
 * spike curtain descends, an enemy enters, or a regular-looking platform reveals
 * it was only a question. Nothing here is generated; triggers only execute the
 * hand-authored objects already placed inside each level file.
 */
export class LevelTriggerField {
  /** @param {Array<object>} triggers invisible law regions. */
  constructor(triggers = []) {
    this.triggers = triggers.map((trigger, index) => ({ ...trigger, id: index, done: false }));
  }

  /** @param {object} world mutable PhysicsWorld vessel. */
  step(world) {
    for (const trigger of this.triggers) {
      if (trigger.once !== false && trigger.done) continue;
      if (!hit(world.player, trigger)) continue;
      trigger.done = true;
      applyTrigger(world, trigger);
    }
  }

  /** @returns {number} activated trigger count. */
  activated() { return this.triggers.filter(trigger => trigger.done).length; }
}

/**
 * Applies a trigger to the mutable world.
 * @param {object} world mutable PhysicsWorld vessel.
 * @param {object} trigger hand-authored trigger payload.
 */
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

function pushRotors(world, rotors) {
  const start = world.rotors.platforms.length;
  world.rotors.platforms.push(...clone(rotors).map((p, i) => ({ ...p, id: start + i, angle: 0, phase: p.phase || i * 0.7 })));
}

function pushTricks(world, tricks) {
  const start = world.tricks.platforms.length;
  world.tricks.platforms.push(...clone(tricks).map((p, i) => ({
    ...p,
    id: start + i,
    baseX: p.x,
    baseY: p.y,
    t: 0,
    broken: 0,
    cooldown: p.delay || 0,
    armed: true,
    alpha: 1,
    solid: !NON_SOLID.has(p.kind),
    hazardous: HAZARDS.has(p.kind)
  })));
}

function pushSpikes(world, spikes) {
  const start = world.spikes.traps.length;
  world.spikes.traps.push(...clone(spikes).map((s, i) => ({
    ...s,
    id: start + i,
    baseX: s.x,
    baseY: s.y,
    cooldown: s.delay || 0.35,
    warn: s.instant ? 0 : (s.warning || 0.45),
    active: s.instant ? (s.duration || 0.9) : 0
  })));
}
