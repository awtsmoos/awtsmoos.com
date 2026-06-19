// B"H
import { RollAngles } from '../grammar/AngleVocabulary.js';
export class RollAngleResolver{static resolve(name='level'){return Number.isFinite(name)?name:RollAngles[name]??0;}}
