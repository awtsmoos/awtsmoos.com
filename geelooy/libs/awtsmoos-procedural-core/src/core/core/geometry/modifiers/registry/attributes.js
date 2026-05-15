
// B"H
/**
 * @file attributes.js
 * @brief The registry for modifiers that alter vertex or face attributes like color, normals, skinning, and tags.
 */

import { setFaceColorModifier, colorByHeightModifier } from '../color.js';
import { computeSmoothNormalsModifier } from '../computeNormals.js';
import { computeFlatNormalsModifier } from '../flatNormals.js';
import { skinningModifier } from '../skinning.js';
import { tagFacesModifier } from '../tag.js';
import { defineShapeKeyModifier } from '../shapeKeyModifier.js';

export const ATTRIBUTE_MODIFIERS = {
    'setFaceColor': (mesh, mod, params) => setFaceColorModifier(mesh, params || mod),
    'colorByHeight': (mesh, mod, params) => colorByHeightModifier(mesh, params || mod),
    'smoothNormals': (mesh) => computeSmoothNormalsModifier(mesh),
    'flatNormals': (mesh) => computeFlatNormalsModifier(mesh),
    'tagFaces': (mesh, mod, params) => tagFacesModifier(mesh, params),
    'skinning': (mesh, mod, params, objectData) => (objectData && objectData.skeleton) ? skinningModifier(mesh, objectData.skeleton) : mesh,
    'defineShapeKey': (mesh, mod, params) => defineShapeKeyModifier(mesh, params)
    // 'tagVertices' will be added here once implemented.
};
