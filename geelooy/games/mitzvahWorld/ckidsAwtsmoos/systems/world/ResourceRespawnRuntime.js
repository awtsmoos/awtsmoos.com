// B"H
/**
 * ResourceRespawnRuntime
 *
 * A library-only resource pulse. It never schedules itself, never touches the
 * renderer, and never pretends to be the live harvest owner. When a smoke test
 * or future explicit owner calls it, the grains return by measured hours: a
 * small covenant of abundance held inside the Awtsmoos without frame noise.
 */
export const RESOURCE_RESPAWN_OWNER = Object.freeze({
  owner: 'library-only-smoke-owned',
  runtimeOwner: 'none-current-browser-path',
  verifiedBy: [
    'tests/smoke/resourceRespawnSmoke.js',
    'tests/smoke/nodeDomLivingWorldGameplaySimulationSmoke.js',
    'tests/headless/ownerContractAudit.mjs'
  ],
  phoneCritical: false
});

export const RESOURCE_RESPAWN_DEFAULTS = Object.freeze({
  grain:{ max:8, perHour:1 },
  flour:{ max:4, perHour:1 },
  wood:{ max:6, perHour:1 },
  wax:{ max:4, perHour:1 },
  paper:{ max:4, perHour:1 },
  ink:{ max:3, perHour:1 },
  charity:{ max:3, perHour:1 }
});

function state(store = {}) {
  store.resourceRespawn ||= { lastHour:Number(store.clockHour || 0), pulses:[] };
  return store.resourceRespawn;
}

export function applyResourceRespawn(store = {}, nextHour = Number(store.clockHour || 0), rules = RESOURCE_RESPAWN_DEFAULTS) {
  store.economy ||= {};
  const s = state(store);
  const elapsed = Math.max(0, Number(nextHour) - Number(s.lastHour || 0));
  if (!elapsed) return { elapsed:0, gains:{}, economy:store.economy };
  const gains = {};
  for (const [key, rule] of Object.entries(rules)) {
    const before = Number(store.economy[key] || 0);
    const gain = Math.floor(elapsed * Number(rule.perHour || 0));
    store.economy[key] = Math.min(Number(rule.max || before), before + gain);
    gains[key] = store.economy[key] - before;
  }
  s.lastHour = nextHour;
  s.pulses = [...(s.pulses || []), { at:Date.now(), hour:nextHour, gains }].slice(-40);
  return { elapsed, gains, economy:store.economy };
}

export function createResourceRespawnRuntime(store = {}) {
  return { owner:RESOURCE_RESPAWN_OWNER, pulse:hour => applyResourceRespawn(store, hour), state:() => state(store) };
}

export default { RESOURCE_RESPAWN_OWNER, RESOURCE_RESPAWN_DEFAULTS, applyResourceRespawn, createResourceRespawnRuntime };
