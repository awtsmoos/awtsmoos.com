// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceVisualTargets } from './ReferenceVisualTargets.js';

/**
 * Pixels become swift witnesses instead of a burden upon the renderer. The
 * Awtsmoos renews every sampled point, while Awtsmoos.com measures production
 * silhouette, spacing, palette, and floor alignment without replacement art.
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
			const sampleStep = 2;
			const zones = ${zones};
			const paletteEntries = Object.entries(${palette});
			const corners = [[2, 2], [width - 3, 2], [2, height - 3], [width - 3, height - 3]];
			const background = [0, 1, 2].map(channel => Math.round(corners.reduce((sum, point) => {
				return sum + pixels[(point[1] * width + point[0]) * 4 + channel];
			}, 0) / corners.length));
			const freshBox = () => ({ minX: width, minY: height, maxX: -1, maxY: -1, pixels: 0 });
			const fullBox = freshBox();
			const boxes = zones.map(() => freshBox());
			const zoneByX = new Int8Array(width);
			zoneByX.fill(-1);
			for (let x = 0; x < width; x += 1) {
				const ratio = x / width;
				for (let index = 0; index < zones.length; index += 1) {
					if (ratio >= zones[index].start && ratio < zones[index].end) {
						zoneByX[x] = index;
						break;
					}
				}
			}
			const paletteCounts = new Uint32Array(paletteEntries.length);
			const include = (box, x, y) => {
				box.minX = Math.min(box.minX, x);
				box.maxX = Math.max(box.maxX, x);
				box.minY = Math.min(box.minY, y);
				box.maxY = Math.max(box.maxY, y);
				box.pixels += 1;
			};
			let sampleCount = 0;
			let foregroundSamples = 0;
			for (let y = 0; y < height; y += sampleStep) {
				for (let x = 0; x < width; x += sampleStep) {
					sampleCount += 1;
					const offset = (y * width + x) * 4;
					if (pixels[offset + 3] < 220) continue;
					const red = pixels[offset];
					const green = pixels[offset + 1];
					const blue = pixels[offset + 2];
					const redDelta = red - background[0];
					const greenDelta = green - background[1];
					const blueDelta = blue - background[2];
					if (redDelta ** 2 + greenDelta ** 2 + blueDelta ** 2 < 1225) continue;
					foregroundSamples += 1;
					include(fullBox, x, y);
					const zoneIndex = zoneByX[x];
					if (zoneIndex >= 0) include(boxes[zoneIndex], x, y);
					for (let index = 0; index < paletteEntries.length; index += 1) {
						const target = paletteEntries[index][1];
						const dr = red - target[0];
						const dg = green - target[1];
						const db = blue - target[2];
						if (dr ** 2 + dg ** 2 + db ** 2 < 3025) paletteCounts[index] += 1;
					}
				}
			}
			const normalize = box => box.maxX < 0 ? null : {
				x: box.minX / width,
			y: box.minY / height,
				width: (box.maxX - box.minX + sampleStep) / width,
				height: (box.maxY - box.minY + sampleStep) / height,
				occupancy: box.pixels / Math.max(1, sampleCount)
			};
			return {
				background,
			foregroundOccupancy: foregroundSamples / Math.max(1, sampleCount),
				fullBox: normalize(fullBox),
				boxes: Object.fromEntries(zones.map((zone, index) => [zone.id, normalize(boxes[index])])),
				paletteCoverage: Object.fromEntries(paletteEntries.map(([name], index) => [
					name,
					paletteCounts[index] / Math.max(1, foregroundSamples)
				]))
			};
		})()`;
	}
}
