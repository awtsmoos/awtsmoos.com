// B"H
/**
 * Chapter 1: the hand touches glass; motion becomes intention.
 * The Awtsmoos hides inside every key press and finger-drag, translating
 * raw noise into direction, jump, and restart without binding game logic.
 */
export class InputVessel {
  /** @param {{stick:HTMLElement,jump:HTMLElement}} els mobile controls */
  constructor(els){
    this.keys = new Set(); this.axis = 0; this.jumpQueued = false;
    this.knob = els.stick.querySelector('i'); this.bindKeys(); this.bindTouch(els);
  }
  /** @returns {{x:number,jump:boolean,restart:boolean}} unified controls */
  read(){
    const left = this.keys.has('ArrowLeft') || this.keys.has('a');
    const right = this.keys.has('ArrowRight') || this.keys.has('d');
    const x = this.axis || (right ? 1 : 0) - (left ? 1 : 0);
    const jump = this.jumpQueued || this.keys.has(' ') || this.keys.has('w') || this.keys.has('ArrowUp');
    const restart = this.keys.has('r'); this.jumpQueued = false;
    return { x, jump, restart };
  }
  bindKeys(){
    addEventListener('keydown', e => { this.keys.add(e.key); if([' ','ArrowUp'].includes(e.key)) e.preventDefault(); });
    addEventListener('keyup', e => this.keys.delete(e.key));
  }
  bindTouch({stick,jump}){
    const reset = () => { this.axis = 0; this.knob.style.transform = 'translate(0,0)'; };
    stick.addEventListener('pointermove', e => {
      if(e.buttons === 0) return; const r = stick.getBoundingClientRect();
      const dx = Math.max(-42, Math.min(42, e.clientX - r.left - r.width / 2));
      this.axis = Math.abs(dx) < 9 ? 0 : Math.sign(dx); this.knob.style.transform = `translate(${dx}px,0)`;
    });
    stick.addEventListener('pointerup', reset); stick.addEventListener('pointerleave', reset);
    jump.addEventListener('pointerdown', () => { this.jumpQueued = true; });
  }
}
