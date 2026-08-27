// B"H
// World state is one quiet table where simulation leaves its offerings.
export function createWorldState() {
  const state = { entries: [], director: {}, weather: {}, wind: {}, time: 0, interactions: [] };
  function setEntries(entries) { state.entries = entries || []; }
  function pushInteraction(kind, x, y, power = 1) { state.interactions.push({ kind, x, y, power, life: 1 }); state.interactions = state.interactions.slice(-24); }
  function update(dt) { state.time += dt; state.interactions = state.interactions.filter(i => (i.life -= .02 * dt) > 0); }
  return { state, setEntries, pushInteraction, update };
}
