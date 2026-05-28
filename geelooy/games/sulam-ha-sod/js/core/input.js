// B"H
/**
 * InputVessel receives intent from keyboard, wide touch zones, and gamepad.
 *
 * The Awtsmoos gives the hand a simple grammar: left, right, jump, continue.
 * Mobile no longer pretends to be a joystick. Two broad direction zones and one
 * jump zone extend upward above their visible buttons, so imperfect thumbs still
 * become clean movement while the game remains about cruel level reading.
 */
export class InputVessel {
  /**
   * @param {{left:HTMLElement,right:HTMLElement,jump:HTMLElement}} els mobile controls.
   */
  constructor(els) {
    this.keys = new Set();
    this.touchLeft = false;
    this.touchRight = false;
    this.jumpHeld = false;
    this.jumpQueued = false;
    this.okQueued = false;
    this.bindKeys();
    this.bindTouch(els);
  }

  /**
   * Returns a complete input snapshot for one frame.
   *
   * @returns {{x:number,jump:boolean,restart:boolean,ok:boolean}}
   */
  read() {
    const pad = this.readGamepad();
    const left = this.keys.has('ArrowLeft') || this.keys.has('a') || this.touchLeft;
    const right = this.keys.has('ArrowRight') || this.keys.has('d') || this.touchRight;
    const x = pad.x || (right ? 1 : 0) - (left ? 1 : 0);
    const jump = this.jumpQueued || this.jumpHeld || pad.jump || this.keys.has(' ') || this.keys.has('w') || this.keys.has('ArrowUp');
    const restart = this.keys.has('r') || pad.restart;
    const ok = this.okQueued || pad.ok || jump || this.keys.has('Enter') || this.keys.has('Escape');
    this.jumpQueued = false;
    this.okQueued = false;
    return { x, jump, restart, ok };
  }

  bindKeys() {
    addEventListener('keydown', event => {
      this.keys.add(event.key);
      if ([' ', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
        this.okQueued = true;
        event.preventDefault();
      }
    });
    addEventListener('keyup', event => this.keys.delete(event.key));
    addEventListener('pointerdown', () => { this.okQueued = true; });
  }

  bindTouch({ left, right, jump }) {
    this.bindHoldZone(left, value => { this.touchLeft = value; });
    this.bindHoldZone(right, value => { this.touchRight = value; });
    this.bindHoldZone(jump, value => {
      this.jumpHeld = value;
      if (value) {
        this.jumpQueued = true;
        this.okQueued = true;
      }
    });
  }

  /**
   * Binds a visible button plus its invisible expanded hit zone.
   *
   * @param {HTMLElement} element visual control button.
   * @param {(value:boolean)=>void} setHeld receives held state.
   */
  bindHoldZone(element, setHeld) {
    const down = event => {
      element.setPointerCapture?.(event.pointerId);
      element.classList.add('held');
      setHeld(true);
      this.okQueued = true;
      event.preventDefault();
    };
    const up = event => {
      element.releasePointerCapture?.(event.pointerId);
      element.classList.remove('held');
      setHeld(false);
      event.preventDefault();
    };
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('lostpointercapture', up);
  }

  readGamepad() {
    const pads = navigator.getGamepads?.() || [];
    const pad = [...pads].find(Boolean);
    if (!pad) return { x: 0, jump: false, restart: false, ok: false };
    const axis = Math.abs(pad.axes?.[0] || 0) > 0.32 ? Math.sign(pad.axes[0]) : 0;
    const pressed = index => Boolean(pad.buttons?.[index]?.pressed);
    return {
      x: axis || (pressed(14) ? -1 : 0) + (pressed(15) ? 1 : 0),
      jump: pressed(0) || pressed(1) || pressed(12),
      restart: pressed(8),
      ok: pressed(0) || pressed(1) || pressed(9)
    };
  }
}
