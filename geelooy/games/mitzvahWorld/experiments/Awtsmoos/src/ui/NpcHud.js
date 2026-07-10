// B"H
/** TopStatusHud: player at left, target next to him, dialogue only from exact NPC click. */
export class NpcHud {
  constructor(targetHost, dialogueHost, bus) { this.host = targetHost || makeHost('npcTarget'); this.dialogueHost = dialogueHost || makeHost('npcDialogue'); this.bus = bus; this.player = { face: '🎩', name: 'Chossid', health: 100, level: 1, xp: 0, xpMax: 100 }; this.target = null; this.build(); }
  build() { this.host.classList.add('Awtsmoos-status-dock'); this.dialogueHost.classList.add('Awtsmoos-npc-dialogue'); this.dialogueHost.dataset.open = 'false'; this.bus.on('npc:target', data => this.showTarget(data)); this.bus.on('npc:dialogue', data => this.showDialogue(data)); this.bus.on('npc:clear', () => this.clearTarget()); this.dialogueHost.addEventListener('pointerup', e => this.click(e)); this.render(); }
  updatePlayer(data = {}) { this.player = { ...this.player, ...data }; this.render(); }
  showTarget(data) { this.target = data; this.render(); }
  clearTarget() { this.target = null; this.close(); this.render(); }
  showDialogue(data) { this.showTarget(data); this.dialogueHost.dataset.open = 'true'; this.dialogueHost.innerHTML = `<section><header><b>${esc(data.face || '🧔')} ${esc(data.name)}</b><button data-close>×</button></header><p>B"H, choose a level vessel. The lava course has clubs to collect across the burning path.</p><button data-level="lava">🔥 Lava obstacle course • collect clubs</button><button data-level="stay">Stay here</button></section>`; }
  render() { this.host.innerHTML = `${playerCard(this.player)}${this.target ? targetCard(this.target) : ''}`; this.host.dataset.hasTarget = this.target ? 'true' : 'false'; }
  click(e) { const close = e.target.closest('[data-close]'), level = e.target.closest('[data-level]'); if (close || level?.dataset.level === 'stay') return this.close(); if (level?.dataset.level === 'lava') { this.bus.emit('level:lava', { from: this.target }); this.close(); } }
  close() { this.dialogueHost.dataset.open = 'false'; }
}
function playerCard(p) { return `<article class="status-card player-card"><div class="status-face">${esc(p.face)}</div><div><b>${esc(p.name)}</b><small>Level ${p.level || 1} • Health ${p.health || 100}</small><meter min="0" max="100" value="${p.health || 100}"></meter><label>⭐ XP ${p.xp || 0}/${p.xpMax || 100}</label><progress max="${p.xpMax || 100}" value="${p.xp || 0}"></progress></div><strong>${p.level || 1}</strong></article>`; }
function targetCard(t) { return `<article class="status-card target-card"><div class="status-face">${esc(t.face || '🧔')}</div><div><b>${esc(t.name)}</b><small>Targeted chossid</small><meter min="0" max="100" value="${t.health || 100}"></meter></div><strong>${t.health || 100}</strong></article>`; }
function makeHost(id) { const el = document.createElement('div'); el.id = id; document.body.append(el); return el; }
function esc(s = '') { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
