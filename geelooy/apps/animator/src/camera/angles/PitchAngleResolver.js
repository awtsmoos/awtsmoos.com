// B"H
import { PitchAngles } from '../grammar/AngleVocabulary.js';
export class PitchAngleResolver{static resolve(name='eyeLevel'){return Number.isFinite(name)?name:PitchAngles[name]??0;}}
