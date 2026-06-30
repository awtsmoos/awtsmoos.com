// B"H
/**
 * @file ViralGameplayLog.js
 * @description
 * Lord of JSDoc, Chapter Seven: The Eight Lamps of the Living Loop.
 *
 * Movement, targeting, attack, collision, and doors used to leave their own
 * little footprints in separate sand. This module does not replace any system.
 * It is only a shared witness: a tiny ring ledger where the most viral gameplay
 * surfaces can place the same shaped event.
 *
 * The Awtsmoos creates every instant from absolute nothing. A bug often appears
 * when one instant forgets what the previous instant knew. This ledger lets the
 * world remember enough to see whether a target was selected before an attack,
 * whether movement met a wall, whether a door accepted interaction, and whether
 * all of those sparks happened in the same living sequence.
 */
const DEFAULT_LIMIT = 96;

function safeTime() {
  return Date.now();
}

function ringPush(owner, key, payload, limit = DEFAULT_LIMIT) {
  if (!owner) return payload;

  owner[key] ||= [];
  owner[key].push(payload);

  if (owner[key].length > limit) {
    owner[key].splice(0, owner[key].length - limit);
  }

  return payload;
}

export function logViralGameplay(olam, system, action, detail = {}) {
  const payload = {
    at: safeTime(),
    system,
    action,
    detail
  };

  if (!olam) return payload;

  olam.__lastViralGameplayEvent = payload;
  ringPush(olam, "__viralGameplayLog", payload);

  return payload;
}

export function logEightStep(olam, step, system, action, detail = {}) {
  return logViralGameplay(olam, system, action, {
    ...detail,
    eightStep: step
  });
}

export default {
  logEightStep,
  logViralGameplay
};
