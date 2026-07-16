// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceVisualTargets } from './ReferenceVisualTargets.js';

/**
 * Pixels become witnesses. The Awtsmoos renews every visible point, while
 * Awtsmoos.com measures silhouette, spacing, palette, and floor alignment from
 * the same production canvas that preview and export reveal.
 */
export class ReferenceCanvasMetrics {
	static expression() {
		const zones = JSON.stringify(ReferenceVisualTargets.zones);
		const palette = JSON.stringify(ReferenceVisualTargets.palette);
		return `(() => {
			const canvas = document.querySelector('#character-canvas');
			const context = canvas.getContext('2d', { willReadFrequently: true });
			const { width, height } = canvas;
			const pixels = context.getImageData(0, 0, width, height).data;
			const zones = ${zones};
			const palette = ${palette};
			const cornerPoints = [[2,2],[width-3,2],[2,height-3],[width-3,height-3]];
			const background = [0,1,2].map(channel => Math.round(cornerPoints.reduce((sum, point) => {
				return sum + pixels[(point[1] * width + point[0]) * 4 + channel];
			}, 0) / cornerPoints.length));
			const freshBox = () => ({ minX: width, minY: height, maxX: -1, maxY: -1, pixels: 0 });
			const fullBox = freshBox();
			const boxes = Object.fromEntries(zones.map(zone => [zone.id, freshBox()]));
			const paletteCounts = Object.fromEntries(Object.keys(palette).map(name => [name, 0]));
			let foregroundPixels = 0;
			const include = (box, x, y) => {
				box.minX = Math.min(box.minX, x); box.maxX = Math.max(box.maxX, x);
				box.minY = Math.min(box.minY, y); box.maxY = Math.max(box.maxY, y); box.pixels += 1;
			};
			for (let y = 0; y < height; y += 1) {
				for (let x = 0; x < width; x += 1) {
					const offset = (y * width + x) * 4;
					const color = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
					const backgroundDistance = color.reduce((sum, value, channel) => sum + (value - background[channel]) ** 2, 0);
					if (backgroundDistance < 1225 || pixels[offset + 3] < 220) continue;
					foregroundPixels += 1; include(fullBox, x, y);
					const zone = zones.find(item => x / width >= item.start && x / width < item.end);
					if (zone) include(boxes[zone.id], x, y);
					for (const [name, target] of Object.entries(palette)) {
						const distance = color.reduce((sum, value, channel) => sum + (value - target[channel]) ** 2, 0);
						if (distance < 3025) paletteCounts[name] += 1;
					}
				}
			}
			const normalize = box => box.maxX < 0 ? null : {
				x: box.minX / width, y: box.minY / height,
				width: (box.maxX - box.minX + 1) / width,
				height: (box.maxY - box.minY + 1) / height,
				occupancy: box.pixels / (width * height)
			};
			return {
				background,
				foregroundOccupancy: foregroundPixels / (width * height),
				fullBox: normalize(fullBox),
				boxes: Object.fromEntries(Object.entries(boxes).map(([id, box]) => [id, normalize(box)])),
				paletteCoverage: Object.fromEntries(Object.entries(paletteCounts).map(([name, count]) => [name, count / Math.max(1, foregroundPixels)]))
			};
		})()`;
	}
}
