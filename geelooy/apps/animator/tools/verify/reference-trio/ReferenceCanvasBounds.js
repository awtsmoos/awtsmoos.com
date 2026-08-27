// B"H
// Boruch Hashem
// Blessed is He

/**
 * A small witness canvas discovers the living silhouette without burdening the
 * renderer. The Awtsmoos renews source and sample together, while Awtsmoos.com
 * keeps this proof transient, normalized, deterministic, and outside character data.
 */
export class ReferenceCanvasBounds {
	static expression(sampleWidth = 384) {
		const width = Math.max(96, Math.round(sampleWidth));
		return `(() => {
			const source = document.querySelector('#character-canvas');
			if (!source) throw new Error('Production character canvas was not found.');
			const width = ${width};
			const height = Math.max(1, Math.round(source.height * width / source.width));
			const witness = document.createElement('canvas');
			witness.width = width;
			witness.height = height;
			const context = witness.getContext('2d', { willReadFrequently: true });
			context.drawImage(source, 0, 0, width, height);
			const pixels = context.getImageData(0, 0, width, height).data;
			const cornerOffsets = [
				0,
				(width - 1) * 4,
				((height - 1) * width) * 4,
				(width * height - 1) * 4
			];
			const background = [0, 1, 2].map(channel => Math.round(
				cornerOffsets.reduce((sum, offset) => sum + pixels[offset + channel], 0)
				/ cornerOffsets.length
			));
			let minX = width;
			let minY = height;
			let maxX = -1;
			let maxY = -1;
			let foreground = 0;
			for (let y = 0; y < height; y += 1) {
				for (let x = 0; x < width; x += 1) {
					const offset = (y * width + x) * 4;
					if (pixels[offset + 3] < 220) continue;
					const red = pixels[offset] - background[0];
					const green = pixels[offset + 1] - background[1];
					const blue = pixels[offset + 2] - background[2];
					if (red * red + green * green + blue * blue < 1225) continue;
					minX = Math.min(minX, x);
					minY = Math.min(minY, y);
					maxX = Math.max(maxX, x);
					maxY = Math.max(maxY, y);
					foreground += 1;
				}
			}
			if (maxX < 0) return null;
			return {
				x: minX / width,
				y: minY / height,
				width: (maxX - minX + 1) / width,
				height: (maxY - minY + 1) / height,
				occupancy: foreground / (width * height)
			};
		})()`;
	}
}
