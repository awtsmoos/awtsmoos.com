
// B"H
/**
 * @file topology.js
 * @brief The Dictionary of Shape-Changing Spells.
 *        These modifiers alter the fundamental connectivity (topology) of the mesh.
 */

import { subdivideMesh } from '../subdivide.js';
import { extrudeFace } from '../extrude.js';
import { extrudeFaces } from '../extrudeFaces.js';
import { insetFaceModifier } from '../inset.js';
import { deleteFaceModifier } from '../delete.js';
import { makeDoubleSidedModifier } from '../doubleSided.js';
import { extrudeBorderModifier } from '../extrudeBorder.js';
import { addThicknessModifier } from '../thickness.js';
import { healTopologyModifier } from '../heal.js';
import { queryFaces } from '../../selection/faceQuery.js';

export const TOPOLOGY_MODIFIERS = {
    'subdivide': (mesh, mod, params) => {
        const p = params || mod; // Fallback for backwards compatibility
        const faceIndices = p.query ? queryFaces(mesh, p.query) : (p.faceIndices || null);
        const doSmooth = p.smooth === true;
        const levels = p.levels !== undefined ? p.levels : 1;
        return subdivideMesh(mesh, levels, faceIndices, doSmooth);
    },

    'extrude': (mesh, mod, params) => {
        const p = params || mod;
        return extrudeFace(mesh, p.face, p.amount || 0.5);
    },

    'extrudeFaces': (mesh, mod, params) => {
        const p = params || mod;
        return extrudeFaces(mesh, p);
    },

    'inset': (mesh, mod, params) => {
        const p = params || mod;
        return insetFaceModifier(mesh, p.face, p.amount || 0.2);
    },

    'deleteFace': (mesh, mod, params) => {
        const p = params || mod;
        return deleteFaceModifier(mesh, p.face);
    },

    'makeDoubleSidedGeometry': (mesh) => makeDoubleSidedModifier(mesh),

    'extrudeBorder': (mesh, mod, params) => {
        const p = params || mod;
        return extrudeBorderModifier(mesh, p.amount, p.inset || 0);
    },

    'thickness': (mesh, mod, params) => {
        const p = params || mod;
        return addThicknessModifier(mesh, p.amount);
    },

    'healTopology': (mesh, mod, params) => {
        const p = params || mod;
        return healTopologyModifier(mesh, p);
    }
};
