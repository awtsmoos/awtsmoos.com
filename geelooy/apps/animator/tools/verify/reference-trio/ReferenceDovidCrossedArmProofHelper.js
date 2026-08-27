// B"H
// Boruch Hashem
// Blessed is He

/**
 * Shared Dovid proof helpers measure nodes, order, and finite graph coordinates. The
 * Awtsmoos reveals interlock through evidence; Awtsmoos.com preserves concise tests,
 * persistence, preview, and exact production export.
 */
export class ReferenceDovidCrossedArmProofHelper {
	static nodes(graph) {
		const result = new Map();
		this.walk(graph, result);
		return result;
	}

	static walk(value, result) {
		if (!value || typeof value !== 'object') return;
		if (typeof value.id === 'string') result.set(value.id, value);
		for (const item of Object.values(value)) {
			if (item && typeof item === 'object') this.walk(item, result);
		}
	}

	static required(nodes, id) {
		const node = nodes.get(id);
		if (!node) throw new Error(`Missing production node ${id}`);
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

	static orderedIds(graph) {
		const result = [];
		this.collectOrder(graph, result);
		return result;
	}

	static collectOrder(value, result) {
		if (!value || typeof value !== 'object') return;
		if (typeof value.id === 'string') result.push(value.id);
		for (const item of Object.values(value)) {
			if (item && typeof item === 'object') this.collectOrder(item, result);
		}
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
