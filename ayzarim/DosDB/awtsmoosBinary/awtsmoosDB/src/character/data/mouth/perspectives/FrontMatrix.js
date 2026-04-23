
/* B”H */
import { FRONT_VISEMES } from './front/Visemes.js';
import { FRONT_EMOTIONS } from './front/Emotions.js';

/**
 * @constant FRONT_MATRIX
 * @description
 * THE HUB OF FRONT FACING EXPRESSION.
 */
export const FRONT_MATRIX = {
  ...FRONT_EMOTIONS,
  ...FRONT_VISEMES
};
