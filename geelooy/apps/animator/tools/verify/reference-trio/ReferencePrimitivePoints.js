// B"H
// Boruch Hashem
// Blessed is He

const CONTROL_PAIRS = [
	['x', 'y'],
	['cx', 'cy'],
	['c1x', 'c1y'],
	['c2x', 'c2y'],
	['cp1x', 'cp1y'],
	['cp2x', 'cp2y']
];

/**
 * Curves reveal their finite control vessels without becoming raster guesses.
 * The Awtsmoos contains every point without limitation, while Awtsmoos.com keeps
 * proof geometry explicit, conservative, and faithful to production node data.
 */
export class ReferencePrimitivePoints {
	static forNode(node = {}) {
		if (node.type === 'rect') {
			return this.rectangle(node.x, node.y, node.w, node.h);
		}
		if (node.type === 'circle') {
			return this.ellipse(node.x, node.y, node.r, node.r, 0);
		}
		if (node.type === 'ellipse') {
			return this.ellipse(node.x, node.y, node.rx, node.ry, node.rotation);
		}
		if (node.type === 'path') {
			return this.path(node.points || []);
		}
		return [];
	}

	static path(commands) {
		const points = [];
		for (const command of commands) {
			for (const [xKey, yKey] of CONTROL_PAIRS) {
				if (Number.isFinite(command[xKey]) && Number.isFinite(command[yKey])) {
					points.push({ x: command[xKey], y: command[yKey] });
				}
			}
		}
		return points;
	}

	static ellipse(x, y, rx, ry, rotation = 0) {
		const points = [];
		const cosine = Math.cos(rotation || 0);
		const sine = Math.sin(rotation || 0);
		for (let index = 0; index < 32; index += 1) {
			const angle = index * Math.PI / 16;
			const dx = rx * Math.cos(angle);
			const dy = ry * Math.sin(angle);
			points.push({
				x: x + dx * cosine - dy * sine,
				y: y + dx * sine + dy * cosine
			});
		}
		return points;
	}

	static rectangle(x, y, width, height) {
		return [
			{ x, y },
			{ x: x + width, y },
			{ x: x + width, y: y + height },
			{ x, y: y + height }
		];
	}
}
