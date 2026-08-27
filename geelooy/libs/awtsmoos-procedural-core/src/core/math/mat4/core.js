
// B"H
/**
 * @file core.js
 * @brief The Master Interface for 4x4 Matrix operations.
 * 
 * POETIC REFLECTION:
 * In this file, the scattered limbs are joined,
 * Like the golden pieces of a currency newly coined.
 * The Identity, the Inverse, the Multiplier's might,
 * Come together here to bring the world into light.
 * We define the API, the speech of the code,
 * To carry the world upon this mathematical road.
 */

import { IdentityProvider } from './constants/identity.js';
import { MatrixMultiplier } from './operations/multiplication.js';
import { MatrixInverter } from './operations/inversion.js';
import { MatrixTransposer } from './operations/transposition.js';
import { PointTransformer } from './transformations/pointTransformer.js';
import { VectorTransformer } from './transformations/vectorTransformer.js';

/**
 * B"H - The Sacred mat4_core.
 * A collection of static methods for manipulating 4x4 vessels.
 */
export const mat4_core = {
    /** B"H - Identity: The state of No Change. */
    identity: () => IdentityProvider.get(),

    /** B"H - Multiply: The Union of two vessels. */
    multiply: (out, a, b) => MatrixMultiplier.execute(out, a, b),

    /** B"H - Inverse: The reversal of the contraction. */
    inverse: (out, a) => MatrixInverter.execute(out, a),

    /** B"H - Transpose: The flipping of the perception. */
    transpose: (out, a) => MatrixTransposer.execute(out, a),

    /** B"H - TransformPoint: The movement of the spark. */
    transformPoint: (out, p, m) => PointTransformer.transform(out, p, m),
    
    /** B"H - TransformVector: The reorientation of pure will. */
    transformVector: (out, v, m) => VectorTransformer.transform(out, v, m)
};
