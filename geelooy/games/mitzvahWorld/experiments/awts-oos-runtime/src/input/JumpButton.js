// B"H
/** JumpButton: a right-hand spark that also listens to Space on desktop. */
export class JumpButton {
  constructor(host) { this.host = host || makeHost(); this.queued = false; this.held = false; this.build(); }
  build() {
    this.button = document.createElement('button');
    this.button.className = 'awts-jump-button'; this.button.type = 'button'; this.button.textContent = 'jump';
    this.host.append(this.button); this.bind();
  }
  bind() {
    this.button.addEventListener('pointerdown', (e) => { e.preventDefault(); this.held = true; this.queued = true; this.button.setPointerCapture?.(e.pointerId); });
    this.button.addEventListener('pointerup', () => { this.held = false; });
    this.button.addEventListener('pointercancel', () => { this.held = false; });
    addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); if (!this.held) this.queued = true; this.held = true; } });
    addEventListener('keyup', (e) => { if (e.code === 'Space') this.held = false; });
  }
  consume() { const out = this.queued; this.queued = false; return out; }
}
function makeHost() { const host = document.createElement('div'); host.id = 'jump'; document.body.append(host); return host; }
