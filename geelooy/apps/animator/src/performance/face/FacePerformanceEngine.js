// B"H
import { EmotionBlend } from './EmotionBlend.js';
import { MouthPerformance } from './MouthPerformance.js';
import { BrowPerformance } from './BrowPerformance.js';
import { EyePerformance } from './EyePerformance.js';
import { CheekPerformance } from './CheekPerformance.js';
import { ExpressionPersonality } from './ExpressionPersonality.js';
export class FacePerformanceEngine {
  static compose(input = {}) {
    const energy = (input.energy ?? 1) * ExpressionPersonality.bias(input.profile);
    const base = EmotionBlend.blend(input.emotion || 'calm', input.moment, input.momentAmount ?? 0.42);
    const mouth = input.speech ? MouthPerformance.fromSpeech({ progress: input.progress, energy, speech: input.speech }) : {};
    const brows = input.speech ? BrowPerformance.fromSpeech(input.progress, energy) : {};
    const eyes = EyePerformance.compose({ blink: input.blink, dart: input.dart, attention: input.attention });
    return { ...base, brows: { ...base.brows, ...brows }, eyes: { ...base.eyes, ...eyes }, mouth: { ...base.mouth, ...mouth }, cheeks: { ...base.cheeks, ...CheekPerformance.fromSmile((base.mouth?.smile || 0) + (mouth.smile || 0)) } };
  }
}
