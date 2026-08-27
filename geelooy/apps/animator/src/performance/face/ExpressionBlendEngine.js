// B"H
import { BrowExpressionModel } from './BrowExpressionModel.js';import { EyeFocusModel } from './EyeFocusModel.js';import { MouthPhonemeModel } from './MouthPhonemeModel.js';import { CheekAndSmileModel } from './CheekAndSmileModel.js';
export class ExpressionBlendEngine { static compose(input={}){const emotion=input.emotion||'calm';const brows=BrowExpressionModel.from(emotion);const eyes=EyeFocusModel.from({...input,emotion});const mouth=MouthPhonemeModel.from({...input,emotion});const cheeks=CheekAndSmileModel.from(mouth);return {brows,eyes,mouth,cheeks};} }
