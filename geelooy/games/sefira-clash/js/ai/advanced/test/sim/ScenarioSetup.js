/** B"H — scenarios are little worlds folded into the first frame. */
export function applyScenario(state, scenario) {
  if (!scenario) return;
  if (scenario === 'edgeHuman') return edgeHuman(state);
  if (scenario === 'chargingHuman') return chargingHuman(state);
  if (scenario === 'rapidJail') return rapidJail(state);
  if (typeof scenario === 'function') scenario(state);
}

function edgeHuman(state) {
  const hero = state.fighters.find(f => f.human), p = state.map.platforms?.[0];
  if (!hero || !p) return;
  hero.x = p.x + p.w - 95; hero.y = p.y; hero.vx = 0; hero.grounded = true; hero.damage = 110;
}

function chargingHuman(state) {
  const hero = state.fighters.find(f => f.human), bot = state.fighters.find(f => !f.human);
  if (!hero || !bot) return;
  hero.x = bot.x - 120; hero.y = bot.y; hero.face = 1; hero.charge ||= {}; hero.charge.punch = 35; hero.chargeGlow = 0.7;
}

function rapidJail(state) {
  const hero = state.fighters.find(f => f.human), bot = state.fighters.find(f => !f.human);
  if (!hero || !bot) return;
  hero.x = bot.x + 64; hero.y = bot.y; hero.grounded = true; hero.stun = 55;
  hero.rapidJail = { active: true, recentHits: 8, attackerId: bot.id, frames: 120, escapeX: 1, escapes: 0 };
}
