
// B"H
/**
 * @file transforms.js
 * @brief The Dictionary of Movement and Orientation.
 *        Modifiers that change position, rotation, and scale without altering topology.
 */

import { scaleMeshModifier, rotateMeshModifier, translateMeshModifier } from '../transformations/globalTransforms.js';
import { translateFaceModifier } from '../transformations/coreTranslation.js';
import { scaleFaceModifier } from '../transformations/coreScale.js';
import { rotateFaceModifier } from '../transformations/coreRotation.js';
import { translateEdgeModifier, scaleEdgeModifier, rotateEdgeModifier } from '../transformations/edgeTransforms.js';
import { translateVertexModifier } from '../transformations/vertexTransforms.js';

import { arrayModifier } from '../array.js';
import { snapToTerrainModifier } from '../terrainSnap.js';
import { exportBoundsModifier, exportCentroidModifier } from '../exportBounds.js';

export const TRANSFORM_MODIFIERS = {
    // --- Global Mesh Transforms ---
    'scaleMesh': (mesh, mod) => scaleMeshModifier(mesh, mod.scale),
    'rotateMesh': (mesh, mod) => rotateMeshModifier(mesh, mod.axis, mod.angle),
    'translateMesh': (mesh, mod) => translateMeshModifier(mesh, mod.translation),

    // --- Component Transforms (Face/Edge/Vertex) ---
    'translateFace': (mesh, mod) => translateFaceModifier(mesh, mod, mod.direction, mod.amount || 0.0),
    'scaleFace': (mesh, mod) => scaleFaceModifier(mesh, mod.face, mod.amount !== undefined ? mod.amount : 1.0),
    'rotateFace': (mesh, mod) => rotateFaceModifier(mesh, mod.face, mod.axis || 'y', mod.angle || 0),
    
    'translateEdge': (mesh, mod) => translateEdgeModifier(mesh, mod.face, mod.edge, mod.translation),
    'scaleEdge': (mesh, mod) => scaleEdgeModifier(mesh, mod.face, mod.edge, mod.amount || 1.0),
    'rotateEdge': (mesh, mod) => rotateEdgeModifier(mesh, mod.face, mod.edge, mod.axis || 'z', mod.angle || 0),
    
    'translateVertex': (mesh, mod) => translateVertexModifier(mesh, mod.face, mod.vertex, mod.translation),

    // --- Advanced Placement ---
    'array': (mesh, mod, params) => arrayModifier(mesh, params),
    'snapToTerrain': (mesh, mod, params) => snapToTerrainModifier(mesh, params),
    
    // --- Metadata Export ---
    'exportBounds': (mesh, mod, params, objectData) => exportBoundsModifier(mesh, params, objectData),
    'exportCentroid': (mesh, mod, params, objectData) => exportCentroidModifier(mesh, params, objectData)
};
