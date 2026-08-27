
// B"H
import { SkinColorPart } from '../definitions/skin/SkinColorPart.js';
import { EyeTypePart } from '../definitions/eyes/EyeTypePart.js';
import { EarShapePart } from '../definitions/ears/EarShapePart.js';
import { MouthEmotionPart } from '../definitions/mouth/MouthEmotionPart.js';
import { MouthAdjustPart } from '../definitions/mouth/MouthAdjustPart.js';
import { ShirtStylePart } from '../definitions/torso/ShirtStylePart.js';
import { ShirtColorPart } from '../definitions/torso/ShirtColorPart.js';
import { PantsStylePart } from '../definitions/legs/PantsStylePart.js';
import { PantsColorPart } from '../definitions/legs/PantsColorPart.js';
import { HairTypePart } from '../definitions/hair/HairTypePart.js';
import { EyebrowShapePart } from '../definitions/hair/EyebrowShapePart.js';
import { BeardStylePart } from '../definitions/hair/BeardStylePart.js';
import { HatTypePart } from '../definitions/head/HatTypePart.js';
import { HatColorPart } from '../definitions/head/HatColorPart.js';
import { FlipXPart } from '../definitions/core/FlipXPart.js';
import { IsTalkingPart } from '../definitions/core/IsTalkingPart.js';
import { EmotionPart } from '../definitions/core/EmotionPart.js';
import { PosePart } from '../definitions/core/PosePart.js';
import { VisibilityParts } from '../definitions/visibility/VisibilityParts.js';

/**
 * @file PartsRegistry.js
 * @description
 * CHAPTER: THE SHATTERED VESSELS REUNITED
 * The monolithic `parts.js` file has been shattered into 19 distinct modules 
 * deep within subfolders. This file is the Keter (Crown) that unites them back 
 * into the dictionary required by the Editor UI.
 */
export const PartsRegistry = {
  skin: SkinColorPart,
  eyes: EyeTypePart,
  earShape: EarShapePart,
  mouth: MouthEmotionPart,
  mouthAdjust: MouthAdjustPart,
  shirt: ShirtStylePart,
  shirtColor: ShirtColorPart,
  pantsStyle: PantsStylePart,
  pantsColor: PantsColorPart,
  hairType: HairTypePart,
  eyebrowShape: EyebrowShapePart,
  beard: BeardStylePart,
  hatType: HatTypePart,
  hat: HatColorPart,
  flipX: FlipXPart,
  isTalking: IsTalkingPart,
  emotion: EmotionPart,
  pose: PosePart,
  ...VisibilityParts
};
