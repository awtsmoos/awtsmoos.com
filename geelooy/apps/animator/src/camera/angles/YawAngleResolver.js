// B"H
import { YawAngles } from '../grammar/AngleVocabulary.js';
export class YawAngleResolver{static resolve(name='classicThreeQuarterRight'){return Number.isFinite(name)?name:YawAngles[name]??YawAngles.classicThreeQuarterRight;}}
