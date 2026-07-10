// B"H
/** NpcHud: top target frame plus dialogue and level choice. */
export class NpcHud {
  constructor(targetHost, dialogueHost, bus) { this.targetHost = targetHost || makeHost('npcTarget'); this.dialogueHost = dialogueHost || makeHost('npcDialogue'); this.bus = bus; this.target = null; this.build(); }
  build() { this.targetHost.classList.add('Awtsmoos-npc-target'); this.dialogueHost.classList.add('Awtsmoos-npc-dialogue'); this.targetHost.dataset.open = 'false'; this.dialogueHost.dataset.open = 'false'; this.bus.on('npc:target', data => this.showTarget(data)); this.bus.on('npc:dialogue', data => this.showDialogue(data)); this.dialogueHost.addEventListener('pointerup', e => this.click(e)); }
  showTarget(data) { this.target = data; this.targetHost.dataset.open = 'true'; this.targetHost.innerHTML = `<div class="npc-face">${esc(data.face || '🧔')}</div><div><b>${esc(data.name)}</b><small>Targeted chossid</small><meter min="0" max="100" value="${data.health || 100}"></meter></div><strong>${data.health || 100}</strong>`; }
  showDialogue(data) { this.showTarget(data); this.dialogueHost.dataset.open = 'true'; this.dialogueHost.innerHTML = `<section><header><b>${esc(data.face || '🧔')} ${esc(data.name)}</b><button data-close>×</button></header><p>B"H, choose a level vessel. The lava course has clubs to collect across the burning path.</p><button data-level="lava">🔥 Lava obstacle course • collect clubs</button><button data-level="stay">Stay here</button></section>`; }
  click(e) { const close = e.target.closest('[data-close]'), level = e.target.closest('[data-level]'); if (close || level?.dataset.level === 'stay') return this.close(); if (level?.dataset.level === 'lava') { this.bus.emit('level:lava', { from: this.target }); this.close(); } }
  close() { this.dialogueHost.dataset.open = 'false'; }
}
function makeHost(id) { const el = document.createElement('div'); el.id = id; document.body.append(el); return el; }
function esc(s = '') { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
