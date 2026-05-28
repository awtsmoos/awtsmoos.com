// B"H
/**
 * InputVessel receives intent from keyboard, glass, and gamepad.
 *
 * The Awtsmoos gives a hand many garments: a key, a thumb on a phone, a stick,
 * a button marked south by the gamepad. This vessel keeps those garments as
 * pure data. Movement, jump, bargain, restart, and OK/continue are all small
 * sparks gathered without binding gameplay logic into the controller.
 */
export class InputVessel {
  /**
   * @param {{stick:HTMLElement,jump:HTMLElement,buy?:HTMLElement}} els mobile controls.
   */
  constructor(els) {
    this.keys = new Set();
    this.axis = 0;
    this.jumpQueued = false;
    this.buyQueued = false;
    this.okQueued = false;
    this.knob = els.stick.querySelector('i');
    this.bindKeys();
    this.bindTouch(els);
  }

  /**
   * Returns a complete input snapshot for one frame.
   * @returns {{x:number,jump:boolean,restart:boolean,buy:boolean,ok:boolean}}
   */
  read() {
    const pad = this.readGamepad();
    const left = this.keys.has('ArrowLeft') || this.keys.has('a');
    const right = this.keys.has('ArrowRight') || this.keys.has('d');
    const x = pad.x || this.axis || (right ? 1 : 0) - (left ? 1 : 0);
    const jump = this.jumpQueued || pad.jump || this.keys.has(' ') || this.keys.has('w') || this.keys.has('ArrowUp');
    const restart = this.keys.has('r') || pad.restart;
    const buy = this.buyQueued || pad.buy || this.keys.has('b');
    const ok = this.okQueued || pad.ok || jump || this.keys.has('Enter') || this.keys.has('Escape');
    this.jumpQueued = false;
    this.buyQueued = false;
    this.okQueued = false;
    return { x, jump, restart, buy, ok };
  }

  bindKeys() {
    addEventListener('keydown', event => {
      this.keys.add(event.key);
      if (event.key === 'b') this.buyQueued = true;
      if ([' ', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        this.okQueued = true;
        event.preventDefault();
      }
    });
    addEventListener('keyup', event => this.keys.delete(event.key));
    addEventListener('pointerdown', () => { this.okQueued = true; });
  }

  bindTouch({ stick, jump, buy }) {
    const reset = () => {
      this.axis = 0;
      this.knob.style.transform = 'translate(0,0)';
    };
    stick.addEventListener('pointermove', event => {
      if (event.buttons === 0) return;
      const rect = stick.getBoundingClientRect();
      const dx = Math.max(-42, Math.min(42, event.clientX - rect.left - rect.width / 2));
      this.axis = Math.abs(dx) < 9 ? 0 : Math.sign(dx);
      this.knob.style.transform = `translate(${dx}px,0)`;
    });
    stick.addEventListener('pointerup', reset);
    stick.addEventListener('pointerleave', reset);
    jump.addEventListener('pointerdown', () => { this.jumpQueued = true; this.okQueued = true; });
    buy?.addEventListener('pointerdown', () => { this.buyQueued = true; this.okQueued = true; });
  }

  readGamepad() {
    const pads = navigator.getGamepads?.() || [];
    const pad = [...pads].find(Boolean);
    if (!pad) return { x: 0, jump: false, restart: false, buy: false, ok: false };
    const axis = Math.abs(pad.axes?.[0] || 0) > 0.32 ? Math.sign(pad.axes[0]) : 0;
    const pressed = index => Boolean(pad.buttons?.[index]?.pressed);
    return {
      x: axis || (pressed(14) ? -1 : 0) + (pressed(15) ? 1 : 0),
      jump: pressed(0) || pressed(1) || pressed(12),
      restart: pressed(8),
      buy: pressed(3),
      ok: pressed(0) || pressed(1) || pressed(9)
    };
  }
}
