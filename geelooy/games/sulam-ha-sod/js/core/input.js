// B"H
/**
 * Chapter 22: Buy became a touchable sigil beside Jump. The hand may bargain
 * by keyboard or glass, and every input remains pure data so the Awtsmoos can
 * pour intent into movement without tangling the market into the controller.
 */
export class InputVessel {
  /** @param {{stick:HTMLElement,jump:HTMLElement,buy?:HTMLElement}} els mobile controls */
  constructor(els){
    this.keys = new Set(); this.axis = 0; this.jumpQueued = false; this.buyQueued = false;
    this.knob = els.stick.querySelector('i'); this.bindKeys(); this.bindTouch(els);
  }
  /** @returns {{x:number,jump:boolean,restart:boolean,buy:boolean}} unified controls */
  read(){
    const left = this.keys.has('ArrowLeft') || this.keys.has('a');
    const right = this.keys.has('ArrowRight') || this.keys.has('d');
    const x = this.axis || (right ? 1 : 0) - (left ? 1 : 0);
    const jump = this.jumpQueued || this.keys.has(' ') || this.keys.has('w') || this.keys.has('ArrowUp');
    const restart = this.keys.has('r'), buy = this.buyQueued || this.keys.has('b');
    this.jumpQueued = false; this.buyQueued = false; return { x, jump, restart, buy };
  }
  bindKeys(){
    addEventListener('keydown', e => {
      this.keys.add(e.key); if(e.key === 'b') this.buyQueued = true;
      if([' ','ArrowUp'].includes(e.key)) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.key));
  }
  bindTouch({stick,jump,buy}){
    const reset = () => { this.axis = 0; this.knob.style.transform = 'translate(0,0)'; };
    stick.addEventListener('pointermove', e => {
      if(e.buttons === 0) return; const r = stick.getBoundingClientRect();
      const dx = Math.max(-42, Math.min(42, e.clientX - r.left - r.width / 2));
      this.axis = Math.abs(dx) < 9 ? 0 : Math.sign(dx); this.knob.style.transform = `translate(${dx}px,0)`;
    });
    stick.addEventListener('pointerup', reset); stick.addEventListener('pointerleave', reset);
    jump.addEventListener('pointerdown', () => { this.jumpQueued = true; });
    buy?.addEventListener('pointerdown', () => { this.buyQueued = true; });
  }
}
