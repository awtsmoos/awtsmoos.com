// B"H
import { FacePose } from './FacePose.js';

/** A small actor's treasury: brows, eyes, cheeks, mouth, and breath. */
export class EmotionLibrary {
  static get(name = 'calm') { return this.poses[name] || this.poses.calm; }
  static poses = {
    calm: FacePose.make({ mouth: { smile: 0.1 }, eyes: { openness: 0.9 } }),
    warm: FacePose.make({ mouth: { smile: 0.48, open: 0.06 }, cheeks: { raise: 0.34 }, eyes: { squint: 0.06 } }),
    happy: FacePose.make({ mouth: { smile: 0.75, open: 0.12 }, cheeks: { raise: 0.5 }, eyes: { squint: 0.12 } }),
    curious: FacePose.make({ brows: { innerRaise: 0.36, outerRaise: 0.28 }, eyes: { openness: 1.08 }, mouth: { open: 0.14 } }),
    thinking: FacePose.make({ brows: { squeeze: 0.34, tilt: 0.16 }, eyes: { squint: 0.2 }, mouth: { smile: 0.04 } }),
    surprised: FacePose.make({ brows: { innerRaise: 0.75, outerRaise: 0.62 }, eyes: { openness: 1.22 }, mouth: { open: 0.58 } }),
    amazed: FacePose.make({ brows: { innerRaise: 0.65, outerRaise: 0.66 }, eyes: { openness: 1.24 }, mouth: { open: 0.44, smile: 0.34 } }),
    focused: FacePose.make({ brows: { squeeze: 0.2 }, eyes: { squint: 0.15, openness: 0.96 }, mouth: { smile: 0.16 } }),
    skeptical: FacePose.make({ brows: { innerRaise: 0.08, outerRaise: -0.08, squeeze: 0.28, tilt: 0.36 }, eyes: { squint: 0.28 }, mouth: { smile: -0.04, frown: 0.12 } }),
    proud: FacePose.make({ brows: { outerRaise: 0.18 }, eyes: { squint: 0.08 }, mouth: { smile: 0.58 }, cheeks: { raise: 0.3 }, head: { nod: 0.12 } }),
    shy: FacePose.make({ brows: { innerRaise: 0.2 }, eyes: { openness: 0.74, dartY: 0.18 }, mouth: { smile: 0.28 }, cheeks: { blush: 0.24 } }),
    relieved: FacePose.make({ brows: { innerRaise: 0.14 }, eyes: { openness: 0.86 }, mouth: { smile: 0.5, open: 0.05 }, cheeks: { raise: 0.22 } }),
    delighted: FacePose.make({ brows: { outerRaise: 0.4 }, eyes: { squint: 0.18, openness: 1.04 }, mouth: { smile: 0.94, open: 0.22 }, cheeks: { raise: 0.62 } }),
    determined: FacePose.make({ brows: { squeeze: 0.34 }, eyes: { squint: 0.18 }, mouth: { smile: 0.18 } }),
    playful: FacePose.make({ brows: { outerRaise: 0.32, tilt: 0.24 }, eyes: { openness: 1.08 }, mouth: { smile: 0.7, open: 0.1 }, cheeks: { raise: 0.32 } }),
    concerned: FacePose.make({ brows: { innerRaise: 0.58, squeeze: 0.24 }, eyes: { openness: 0.92 }, mouth: { frown: 0.22, open: 0.08 } }),
    listening: FacePose.make({ brows: { innerRaise: 0.12 }, eyes: { openness: 0.98 }, mouth: { smile: 0.18 }, cheeks: { raise: 0.12 } })
  };
}
