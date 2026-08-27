// B"H
/** Chapter 568: The HUD chants velocity without multiplying its own mouth. */
function stat(label, value) { return `<div class="civilization-hud-stat"><b>${label}</b><br>${value}</div>`; }
function pill(text) { return `<span id="civilization-status-pill" class="civilization-status-pill civ-chip"><i class="civilization-status-dot"></i>${text}</span>`; }
export const CivilizationHud = {
  node: null,
  status: null,
  init() {
    this.node = document.getElementById('hud-stats');
    this.status = document.getElementById('status-right');
    if (this.node) this.node.style.display = 'block';
  },
  render(state = {}) {
    if (!this.node) this.init();
    const totals = state.totals || {};
    const velocity = state.velocity || {};
    const health = state.health || {};
    if (this.node) this.node.innerHTML = `<div class="civilization-hud"><div class="civilization-hud-title">Civilization Pulse</div><div class="civilization-hud-grid">${stat('EVT', totals.events || 0)}${stat('ACT', totals.actors || 0)}${stat('1H', velocity.lastHour || 0)}${stat('HEALTH', health.level || 'quiet')}</div></div>`;
    const existing = document.getElementById('civilization-status-pill');
    const html = pill(`CIV ${health.level || 'quiet'} · ${totals.events || 0}`);
    if (existing) existing.outerHTML = html;
    else if (this.status) this.status.insertAdjacentHTML('beforeend', html);
  }
};
