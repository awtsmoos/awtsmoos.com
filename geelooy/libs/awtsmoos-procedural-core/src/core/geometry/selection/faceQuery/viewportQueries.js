
// B"H
/**
 * @file viewportQueries.js
 * @chapter THE OMNISCIENT GAZE
 * 
 * THE LENS OF THE TZIMTZUM:
 * We compress the 3D reality into a 2D screen,
 * Filtering out the unseen and the obscene.
 * Array filters determine if the point is contained,
 * Ensuring the pure boundaries are forever maintained.
 * 
 * @module ViewportQueries
 */

import { VirtualViewport } from '../virtualViewport.js';
import { getFaceCentroid } from './utils.js';

export const VIEWPORT_QUERIES = Object.freeze({
    'screenBox': (mesh, params, allIndices) => {
        const { camera, rect } = params;
        const vpMat = VirtualViewport.getVPMatrix(camera);
        const minX = rect.minX ?? -1.0; const maxX = rect.maxX ?? 1.0;
        const minY = rect.minY ?? -1.0; const maxY = rect.maxY ?? 1.0;

        return new Set(
            Array.from(allIndices).filter(idx => {
                const ndc = VirtualViewport.projectPoint(getFaceCentroid(mesh.faces[idx]), vpMat);
                return ndc && ndc[0] >= minX && ndc[0] <= maxX && ndc[1] >= minY && ndc[1] <= maxY;
            })
        );
    }
});
