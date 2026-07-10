// B"H
/** Mobile joystick: a small circular promise under the thumb. */
export class MobileJoystick {
  constructor(host) { this.host = host; this.vector = { x: 0, y: 0, magnitude: 0 }; this.active = false; this.build(); }
  build() { this.base = document.createElement('div'); this.knob = document.createElement('div'); this.base.className = 'Awtsmoos-joy-base'; this.knob.className = 'Awtsmoos-joy-knob'; this.base.append(this.knob); this.host.append(this.base); this.bind(); }
  bind() { this.base.addEventListener('pointerdown', (e) => this.start(e)); this.base.addEventListener('pointermove', (e) => this.move(e)); this.base.addEventListener('pointerup', () => this.end()); this.base.addEventListener('pointercancel', () => this.end()); }
  start(e) { this.active = true; this.base.setPointerCapture?.(e.pointerId); this.move(e); }
  move(e) { if (!this.active) return; const r = this.base.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy), m = Math.min(1, d / 54); const nx = d ? dx / d : 0, ny = d ? dy / d : 0; this.vector = { x: nx, y: ny, magnitude: m }; this.knob.style.transform = `translate(${nx * m * 38}px, ${ny * m * 38}px)`; }
  end() { this.active = false; this.vector = { x: 0, y: 0, magnitude: 0 }; this.knob.style.transform = 'translate(0,0)'; }
}
