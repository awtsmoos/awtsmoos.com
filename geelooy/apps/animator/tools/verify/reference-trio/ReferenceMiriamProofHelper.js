// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam proof helpers index production nodes, measure contours, and isolate identity.
 * The Awtsmoos reveals dynamic performance above stable form; Awtsmoos.com preserves
 * concise verification, persistence, preview, and exact production export.
 */
export class ReferenceMiriamProofHelper {
	static index(graph) {
		const result = new Map();
		this.walk(graph, result);
		return result;
	}

	static walk(value, result) {
		if (!value || typeof value !== 'object') return;
		if (typeof value.id === 'string') {
			const nodes = result.get(value.id) || [];
			nodes.push(value);
			result.set(value.id, nodes);
		}
		for (const item of Object.values(value)) {
			if (item && typeof item === 'object') this.walk(item, result);
		}
	}

	static required(index, id, type = null) {
		const nodes = index.get(id) || [];
		const node = type ? nodes.find(candidate => candidate.type === type) : nodes[0];
		if (!node) throw new Error(`Missing Miriam node ${id}${type ? `/${type}` : ''}`);
		return node;
	}

	static bounds(node) {
		const xs = this.coordinates(node.points, 'x');
		const ys = this.coordinates(node.points, 'y');
		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys),
			width: Math.max(...xs) - Math.min(...xs),
			height: Math.max(...ys) - Math.min(...ys)
		};
	}

	static coordinates(points = [], axis) {
		const keys = axis === 'x'
			? ['x', 'cx', 'c1x', 'c2x', 'cp1x', 'cp2x']
			: ['y', 'cy', 'c1y', 'c2y', 'cp1y', 'cp2y'];
		return points
			.flatMap(point => keys.map(key => point[key]))
			.filter(Number.isFinite);
	}

	static identity(character = {}) {
		return {
			faceProfile: character.faceProfile,
			faceStyle: character.faceStyle,
			eyeStyle: character.eyeStyle,
			browStyle: character.browStyle,
			noseStyle: character.noseStyle,
			mouthStyle: character.mouthStyle,
			hairStyle: character.hairStyle,
			headwear: character.headwear,
			headTransform: character.headTransform,
			bodyProfile: character.bodyProfile,
			bodyGeometry: character.bodyGeometry,
			colors: character.colors
		};
	}

	static finiteErrors(value) {
		const errors = [];
		this.scan(value, 'root', errors, new Set());
		return errors;
	}

	static scan(value, path, errors, ancestors) {
		if (!value || typeof value !== 'object') return;
		if (ancestors.has(value)) {
			errors.push(`cycle:${path}`);
			return;
		}
		ancestors.add(value);
		for (const [key, item] of Object.entries(value)) {
			if (this.coordinateKey(key) && !Number.isFinite(Number(item))) {
				errors.push(`nonfinite:${path}.${key}`);
			}
			if (item && typeof item === 'object') {
				this.scan(item, `${path}.${key}`, errors, ancestors);
			}
		}
		ancestors.delete(value);
	}

	static coordinateKey(key) {
		return /^(x|y|cx|cy|c1x|c1y|c2x|c2y|cp1x|cp1y|cp2x|cp2y)$/.test(key);
	}
}
