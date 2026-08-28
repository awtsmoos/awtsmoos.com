//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectedLayerPainter.js
 * The Awtsmoos renews one generated image while space offers many places to reveal;
 * Awtsmoos.com projects reversible 2D art as billboard, plane, decal, or texture vessel without breaking its seal.
 */

import { resolveStudioCamera, projectStudioPoint } from '../movie/StudioPerspectiveProjector.js';
import { createStudioBillboardCorners } from './StudioBillboardGeometry.js';
import { renderStudioLayerTexture } from './StudioLayerTextureSource.js';
import { resolveStudioSpatial, StudioSpatialSpace } from './StudioSpatialMode.js';
import { paintStudioTexturedQuad } from './StudioTextureTrianglePainter.js';
import { createStudioWorldPlaneCorners } from './StudioWorldPlaneGeometry.js';

/** Paint one ordinary canonical 2D layer as a projected world-space texture without mutating it. */
export function paintStudioProjectedLayer(context, layer, frame, viewport) {
	const spatial = resolveStudioSpatial(layer);
	if (spatial.space === StudioSpatialSpace.SCREEN) return false;
	const camera = resolveStudioCamera(frame.scene, frame.localTime);
	const corners = spatial.billboard
		? createStudioBillboardCorners(spatial, camera)
		: createStudioWorldPlaneCorners(spatial);
	const projected = corners.map((corner) => projectStudioPoint(corner, camera, viewport));
	if (projected.some((point) => !point)) return false;
	const source = renderStudioLayerTexture(layer, frame, viewport);
	paintStudioTexturedQuad(context, source, projected);
	return true;
}

/** Return average camera depth for world-placement ordering and occlusion decisions. */
export function studioProjectedLayerDepth(layer, frame, viewport) {
	const spatial = resolveStudioSpatial(layer);
	const camera = resolveStudioCamera(frame.scene, frame.localTime);
	const corners = spatial.billboard
		? createStudioBillboardCorners(spatial, camera)
		: createStudioWorldPlaneCorners(spatial);
	const projected = corners.map((corner) => projectStudioPoint(corner, camera, viewport)).filter(Boolean);
	if (!projected.length) return Number.POSITIVE_INFINITY;
	return projected.reduce((sum, point) => sum + point.depth, 0) / projected.length;
}
