// B"H
/** The Awtsmoos keeps the Chossid alive with finite health, damage, and healing. */
const KEY = "__AWTSMOOS_PLAYER_HEALTH_STATE__";
const finite = (v, f) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, finite(v, lo)));
let memory = { current:100, max:100, low:false, dead:false, updatedAt:Date.now() };

function stored() { return typeof window !== "undefined" ? window[KEY] || memory : memory; }
function publish(state, detail = {}) {
  memory = state;
  if (typeof window !== "undefined") {
    window[KEY] = state;
    window.dispatchEvent?.(new CustomEvent("awtsmoos-player-health", { detail:{ ...state, ...detail } }));
  }
  return state;
}

export function ensurePlayerHealthState(input = {}) {
  const prev = stored();
  const max = Math.max(1, finite(input.max ?? input.maxHealth ?? prev?.max, 100));
  const current = clamp(input.current ?? input.health ?? prev?.current ?? max, 0, max);
  return publish({ current, max, low:current / max <= .3, dead:current <= 0, updatedAt:Date.now() }, { reason:"ensure" });
}

export function damagePlayerHealth(amount = 0, reason = "damage") {
  const s = ensurePlayerHealthState();
  const delta = Math.max(0, finite(amount, 0));
  const current = clamp(s.current - delta, 0, s.max);
  return publish({ ...s, current, low:current / s.max <= .3, dead:current <= 0, updatedAt:Date.now() }, { reason, delta:-delta });
}

export function healPlayerHealth(amount = 0, reason = "heal") {
  const s = ensurePlayerHealthState();
  const delta = Math.max(0, finite(amount, 0));
  const current = clamp(s.current + delta, 0, s.max);
  return publish({ ...s, current, low:current / s.max <= .3, dead:current <= 0, updatedAt:Date.now() }, { reason, delta });
}

export function playerHealthSnapshot() {
  const s = ensurePlayerHealthState(stored());
  return { ...s, low:s.current / Math.max(1, s.max) <= .3, dead:s.current <= 0, finite:Number.isFinite(s.current) && Number.isFinite(s.max) };
}

if (typeof window !== "undefined") {
  ensurePlayerHealthState();
  window.__AWTSMOOS_DAMAGE_PLAYER__ = damagePlayerHealth;
  window.__AWTSMOOS_HEAL_PLAYER__ = healPlayerHealth;
}
