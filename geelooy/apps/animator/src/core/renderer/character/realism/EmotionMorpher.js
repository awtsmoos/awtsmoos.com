
/* B”H */

/**
 * @class EmotionMorpher
 * @description
 * THE RIVER OF FEELING (Nahara DeRegesh).
 * Emotions must flow, not snap. This engine tracks the historical emotional state 
 * of each character and smoothly interpolates the geometric parameters using
 * blend shapes for hyper-realistic expressions.
 */
export class EmotionMorpher {
  static states = new Map();

  static process(id, data, deltaTime) {
    if (!this.states.has(id)) {
      this.states.set(id, {
        params: { bx: 0, bi: 0, bo: 0, ba: -5, squint: 1.0, cheek: 0, mouthSmile: 0, mouthFrown: 0 }
      });
    }

    const state = this.states.get(id);

    // Dynamic blend shape targets built from biometric intensity vectors
    const joy = data.joy || 0;
    const sadness = data.sadness || 0;
    const conc = data.concentration || 0;
    const stress = data.stress || 0;
    const surprise = data.surprise || 0;
    const hate = data.hate || 0;

    let target = {
      bx: 0, bi: 0, bo: 0, ba: -5, squint: 1.0, cheek: 0, mouthSmile: 0, mouthFrown: 0, mouthGrimace: 0
    };

    // Apply Blend Shapes additively
    
    // Joy (Smiling, squinting, cheeks raising)
    target.ba += -13 * joy;
    target.bi += -8 * joy;
    target.bo += -8 * joy;
    target.squint -= 0.15 * joy;
    target.cheek += 5 * joy;
    target.mouthSmile += joy;

    // Sadness (Inner brows raised, crying frown)
    target.bx += -2 * sadness;
    target.bi += -12 * sadness;
    target.bo += 8 * sadness;
    target.ba += -5 * sadness;
    target.squint -= 0.2 * sadness;
    target.mouthFrown += sadness;

    // Hate (Disgust, sneer, grimace, harsh brow pinch)
    target.bx += -6 * hate;
    target.bi += 16 * hate;
    target.bo += -10 * hate;
    target.ba += 5 * hate;
    target.squint -= 0.4 * hate;
    target.cheek += 10 * hate;
    target.mouthGrimace += hate;

    // Concentration (Brows knit tight)
    target.bx += -4 * conc;
    target.bi += 4 * conc;
    target.ba += 2 * conc;
    target.squint -= 0.3 * conc;

    // Stress / Anger
    target.bx += -4 * stress;
    target.bi += 12 * stress;
    target.bo += -12 * stress;
    target.squint -= 0.3 * stress;

    // Surprise (Brows fly up wide)
    target.bx += 3 * surprise;
    target.bi += -18 * surprise;
    target.bo += -18 * surprise;
    target.ba += -20 * surprise;
    target.squint += 0.3 * surprise;

    // Hard Override if string emotion acts as primary
    if (data.emotion === 'angry') { target.bx=-4; target.bi=12; target.bo=-12; }
    if (data.emotion === 'happy') { target.mouthSmile = 1; target.squint = 0.85; }
    if (data.emotion === 'sad') { target.mouthFrown = 1; target.bi = -12; }
    if (data.emotion === 'hate') { target.mouthGrimace = 1; target.bi = 16; target.cheek = 10; target.squint = 0.6; }
    
    // Lerp factor
    const friction = 0.25; 

    // Smoothly interpolate towards the blended targets
    state.params.bx += (target.bx - state.params.bx) * friction;
    state.params.bi += (target.bi - state.params.bi) * friction;
    state.params.bo += (target.bo - state.params.bo) * friction;
    state.params.ba += (target.ba - state.params.ba) * friction;
    state.params.squint += (target.squint - state.params.squint) * friction;
    state.params.cheek += (target.cheek - state.params.cheek) * friction;
    state.params.mouthSmile += (target.mouthSmile - state.params.mouthSmile) * friction;
    state.params.mouthFrown += (target.mouthFrown - state.params.mouthFrown) * friction;
    state.params.mouthGrimace = state.params.mouthGrimace || 0;
    state.params.mouthGrimace += (target.mouthGrimace - state.params.mouthGrimace) * friction;

    return state.params;
  }
}
