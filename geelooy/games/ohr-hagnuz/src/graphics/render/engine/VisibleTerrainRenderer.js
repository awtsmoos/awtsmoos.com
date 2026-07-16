// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisibleTerrainRenderer.js
 * @description Projects visible overhead tiles with one coherent regional theme.
 *
 * The Awtsmoos renews every map as one garment. Awtsmoos.com resolves its palette
 * once per frame so ground, roads, water, trees, and ruins remain harmonized.
 */
import { StateRegister } from '../../../binah/StateRegister.js';
import { ArchitecturalManifest } from '../../../render/ArchitecturalManifest.js';
import { GroundPainter } from '../GroundPainter.js';
import { RoadPainter } from '../RoadPainter.js';
import { resolveRegionVisualTheme } from '../theme/RegionVisualTheme.js';
import { RenderQueueBuilder } from './RenderQueueBuilder.js';

export class VisibleTerrainRenderer {
	static draw(context, queue, registry, camera, viewport, resolution, isHouse) {
		const tileIndex = new Map(registry.map(tile => [`${tile.x}:${tile.y}`, tile]));
		const theme = resolveRegionVisualTheme(StateRegister.CurrentMapId);
		for (const tile of registry) {
			const x = tile.x * resolution - camera.x;
			const y = tile.y * resolution - camera.y;
			if (!this.isVisible(x, y, resolution, viewport)) continue;
			this.drawGround(context, tile, x, y, resolution, isHouse, tileIndex, theme);
			RenderQueueBuilder.enqueueTile(queue, tile, x, y, resolution, theme);
		}
	}

	static isVisible(x, y, resolution, viewport) {
		const margin = resolution * 2;
		return x > -margin
			&& x < viewport.width + margin
			&& y > -margin
			&& y < viewport.height + margin;
	}

	static drawGround(context, tile, x, y, resolution, isHouse, tileIndex, theme) {
		if (isHouse) {
			ArchitecturalManifest.drawWoodFloor(context, x, y, resolution);
			if (tile.t === 'G_STAIRS') {
				ArchitecturalManifest.drawStairs(context, x, y, resolution);
			}
			return;
		}
		if (tile.t === 'G_DIRT_PATH') {
			RoadPainter.draw(context, x, y, resolution, tile, tileIndex, theme);
			return;
		}
		GroundPainter.draw(context, x, y, resolution, tile, theme);
	}
}
