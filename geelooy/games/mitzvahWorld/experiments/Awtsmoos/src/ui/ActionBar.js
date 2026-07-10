// B"H
/** ActionBar: two living slots now; dormant slots can return when asked. */
export class ActionBar {
  constructor(host, bus, state) { this.host = host || makeHost(); this.bus = bus; this.state = state; this.actions = ['bag', 'run']; this.build(); }
  build() { this.host.classList.add('Awtsmoos-action-host'); this.host.innerHTML = `<nav class="Awtsmoos-action-bar" aria-label="B'H action slots"></nav>`; this.bar = this.host.querySelector('.Awtsmoos-action-bar'); this.render(); this.bus.on('mode:changed', () => this.render()); this.bindKeys(); }
  render() { this.bar.innerHTML = this.actions.map(a => a === 'bag' ? slot('bag', '🎒', 'Bag') : slot('run', this.state.runMode ? '🏃' : '🚶', this.state.runMode ? 'Run' : 'Walk')).join(''); this.bar.querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => this.action(e, b.dataset.action))); }
  action(e, action) { e.preventDefault(); e.stopPropagation(); if (action === 'bag') this.bus.emit('inventory:toggle'); if (action === 'run') this.bus.emit('mode:toggle-run'); }
  bindKeys() { addEventListener('keydown', e => { if (e.repeat) return; if (e.key === 'i' || e.key === 'I') this.bus.emit('inventory:toggle'); if (e.key === 'Shift') this.bus.emit('mode:toggle-run'); }); }
}
function slot(action, icon, label) { return `<button data-action="${action}" aria-label="${label}"><span>${icon}</span><small>${label}</small></button>`; }
function makeHost() { const host = document.createElement('div'); document.body.append(host); return host; }
