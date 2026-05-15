
// B"H
/**
 * @file csgPrimitiveTransform.js
 * @chapter THE AIMING OF THE BLADE
 * 
 * THE PSALM OF THE GUIDED STRIKE:
 * The cutter is forged, but where shall it fall?
 * The transform array answers the call!
 * We map the positions, we twist on the pole,
 * Slicing exactly through the intended soul!
 * 
 * @module CSGPrimitiveTransform
 */

import { scaleMeshModifier, translateMeshModifier, rotateMeshModifier } from '../transformations/globalTransforms.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

const TRANSFORM_DISPATCH = Object.freeze({
    'scale': (mesh, val) => scaleMeshModifier(mesh, val),
    'position': (mesh, val) => translateMeshModifier(mesh, val),
    'rotation': (mesh, val) => {
         executeCondition(val[0], () => rotateMeshModifier(mesh, 'x', val[0]));
         executeCondition(val[1], () => rotateMeshModifier(mesh, 'y', val[1]));
         executeCondition(val[2], () => rotateMeshModifier(mesh, 'z', val[2]));
         return mesh;
    }
});

/**
 * @brief Applies an object of transformations sequentially via mapping.
 */
export const applyCutterTransforms = (cutterData, transformParams) => {
    return executeCondition(transformParams, () => {
        Object.entries(transformParams).forEach(([key, val]) => {
            executeCondition(TRANSFORM_DISPATCH[key], () => TRANSFORM_DISPATCH[key](cutterData, val));
        });
        return cutterData;
    }, () => cutterData);
};
