// B"H
/** UI event system: keyboard, pointer, and joystick become one input nefesh. */
export class UiEventSystem {
  constructor(target = window) { this.target = target; this.keys = new Set(); this.pointer = { x: 0, y: 0, down: false }; }
  install(bus) { addEventListener('keydown', (e) => { this.keys.add(e.code); bus.emit('input:key', this.state()); }); addEventListener('keyup', (e) => { this.keys.delete(e.code); bus.emit('input:key', this.state()); }); this.target.addEventListener('pointerdown', (e) => this.pointerEvent(e, true, bus)); this.target.addEventListener('pointermove', (e) => this.pointerEvent(e, this.pointer.down, bus)); this.target.addEventListener('pointerup', (e) => this.pointerEvent(e, false, bus)); return this; }
  pointerEvent(e, down, bus) { this.pointer = { x: e.clientX, y: e.clientY, down }; bus.emit('input:pointer', this.pointer); }
  axis() { return { x: (this.keys.has('KeyD') || this.keys.has('ArrowRight')) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft')), y: (this.keys.has('KeyS') || this.keys.has('ArrowDown')) - (this.keys.has('KeyW') || this.keys.has('ArrowUp')) }; }
  state() { return { keys: [...this.keys], pointer: this.pointer, axis: this.axis() }; }
}
