// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldProjectionRenderer.js
 * @description Projects canonical map tiles through one strict overhead camera.
 *
 * The Awtsmoos renews each road, reed, doorway, and footprint in one indivisible
 * world. Awtsmoos.com reveals that unity here without inventing terrain beyond
 * the map, changing collision, or drawing any horizon.
 */
import { State } from '../../../binah/State.js';
import { WorldData, groundGlyph, tileMeta } from '../../../data/WorldData.js';
import { Ground } from '../Ground.js';
import { drawGlyphObject } from '../GlyphRenderer.js';

export class WorldProjectionRenderer {
	/**
	 * Draws all visible canonical tiles and then preserves established Y sorting.
	 *
	 * @param {CanvasRenderingContext2D} background Ground context.
	 * @param {CanvasRenderingContext2D} objects Object context.
	 * @param {{x:number,y:number,w:number,h:number}} camera Camera in CSS pixels.
	 */
	static draw(background, objects, camera) {
		const resolution = State.Resolution;
		const map = WorldData[State.MapId] || [];
		const bounds = this.visibleBounds(map, camera, resolution);
		const queue = [];
		for (let rowIndex = bounds.y0; rowIndex <= bounds.y1; rowIndex += 1) {
			const row = [...(map[rowIndex] || '')];
			for (let columnIndex = bounds.x0; columnIndex <= bounds.x1; columnIndex += 1) {
				this.drawTile(background, objects, queue, camera, {
					rx: columnIndex,
					ry: rowIndex,
					glyph: row[columnIndex] || ' ',
					resolution
				});
			}
		}
		queue.sort((left, right) => left.y - right.y);
		for (const item of queue) item.draw();
	}

	static visibleBounds(map, camera, resolution) {
		const width = Math.max(1, ...map.map(row => [...row].length));
		const height = map.length || 1;
		return {
			x0: Math.max(0, Math.floor(camera.x / resolution) - 2),
			y0: Math.max(0, Math.floor(camera.y / resolution) - 2),
			x1: Math.min(width - 1, Math.ceil((camera.x + camera.w) / resolution) + 2),
			y1: Math.min(height - 1, Math.ceil((camera.y + camera.h) / resolution) + 2)
		};
	}

	static drawTile(background, objects, queue, camera, tile) {
		const { rx, ry, glyph, resolution } = tile;
		const x = rx * resolution - camera.x;
		const y = ry * resolution - camera.y;
		const metadata = tileMeta(glyph);
		Ground.draw(background, x, y, resolution, groundGlyph(glyph), rx * 13 + ry * 7);
		if (metadata.kind === 'edge') {
			this.drawPortal(objects, x, y, resolution, metadata.edge);
			return;
		}
		if (['floor', 'grass', 'road'].includes(metadata.kind)) return;
		queue.push({
			y: y + resolution,
			draw: () => drawGlyphObject(objects, {
				meta: metadata,
				glyph,
				x,
				y,
				rx,
				ry,
				seed: rx * ry + 1
			}, resolution)
		});
	}

	static drawPortal(context, x, y, size, edge) {
		const symbol = { N: '↑', S: '↓', E: '→', W: '←' }[edge] || '✦';
		const inset = Math.max(7, size * 0.15);
		const centerX = x + size / 2;
		const centerY = y + size / 2;
		const glow = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, size * 0.42);
		glow.addColorStop(0, 'rgba(255,253,231,.98)');
		glow.addColorStop(0.35, 'rgba(206,147,216,.78)');
		glow.addColorStop(1, 'rgba(48,31,59,.12)');
		context.save();
		context.fillStyle = glow;
		context.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
		context.strokeStyle = 'rgba(230,198,255,.9)';
		context.lineWidth = 1.5;
		context.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
		context.fillStyle = '#fffde7';
		context.font = `700 ${Math.round(size * 0.42)}px Inter, system-ui, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(symbol, centerX, centerY);
		context.restore();
	}
}
