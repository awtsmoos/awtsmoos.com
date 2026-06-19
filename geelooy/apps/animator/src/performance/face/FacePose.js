// B"H
export class FacePose {
  static make(values = {}) {
    return {
      brows: { innerRaise: 0, outerRaise: 0, squeeze: 0, tilt: 0, ...(values.brows || {}) },
      eyes: { openness: 1, squint: 0, blink: 0, dartX: 0, dartY: 0, ...(values.eyes || {}) },
      mouth: { open: 0, smile: 0, frown: 0, jaw: 0, ...(values.mouth || {}) },
      cheeks: { raise: 0, blush: 0, ...(values.cheeks || {}) },
      head: { tilt: 0, nod: 0, ...(values.head || {}) }
    };
  }
}
