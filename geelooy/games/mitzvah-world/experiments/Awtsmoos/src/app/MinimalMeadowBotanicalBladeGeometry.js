// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBotanicalBladeGeometry.js
 * @description Folds real botanical leaves into curved, shaded, connected quad geometry.
 * The Awtsmoos raises a vein between each edge and bathes the leaf in light;
 * Awtsmoos.com roots its living blades without extra meshes in sight.
 */

/** Builds one rooted, tapered botanical blade inside the existing batched mesh. */
export function appendMinimalMeadowBladeSurface(target, options) {
	const segments = Math.max(2, Math.min(4, options.segments || 3));
	const folded = options.folded === true;
	const width = Math.max(0.002, Math.abs(options.width || 0.02));
	const height = Math.max(0.002, Number(options.height) || 0.02);
	const angle = Number(options.angle) || 0;
	const direction = [Math.cos(angle), Math.sin(angle)];
	const normal = [-direction[1], direction[0]];
	const bend = Math.max(-height * 0.65, Math.min(height * 0.65, options.bend || 0));
	const color = options.color || [1, 1, 1, 1];
	let previous = sectionAt(0);
	for (let index = 1; index <= segments; index += 1) {
		const current = sectionAt(index / segments);
		if (folded) {
			appendQuad(target, previous, current, 0, 1);
			appendQuad(target, previous, current, 1, 2);
		} else {
			appendQuad(target, previous, current, 0, 2);
		}
		previous = current;
	}
	return segments * (folded ? 2 : 1);

	/** Supplies continuous left, midrib and right profiles. */
	function sectionAt(t) {
		const taper = Math.max(0.035, 1 - t * 0.98);
		const w = width * taper;
		const displacement = bend * t * t;
		const ridge = folded ? w * 0.38 * Math.sin(Math.PI * t) : 0;
		const x = options.x + normal[0] * displacement;
		const z = options.z + normal[1] * displacement;
		const y = options.y + height * t;
		const tint = 0.76 + 0.3 * Math.sin(Math.PI * t * 0.72);
		return [
			vertex(x - direction[0] * w, y, z - direction[1] * w, tint * 0.88, t),
			vertex(x + normal[0] * ridge, y, z + normal[1] * ridge, tint * 1.10, t),
			vertex(x + direction[0] * w, y, z + direction[1] * w, tint * 0.91, t)
		];
	}

	/** Keeps alpha unchanged while shaping root shadow and a subtle highlight. */
	function vertex(x, y, z, brightness, v) {
		const tint = brightness * (1 + v * 0.035);
		return {
			color: color.map((channel, index) => index === 3 ? channel
				: Math.max(0, Math.min(1, channel * tint))),
			position: [x, y, z],
			v
		};
	}
}

/** Uses the original quad index contract and coherent vertical UV coordinates. */
function appendQuad(target, previous, current, left, right) {
	const corners = [previous[left], previous[right], current[right], current[left]];
	const start = target.vertices.length;
	for (const corner of corners) {
		target.vertices.push(corner.position);
		target.colors.push(corner.color);
	}
	target.faces.push([start, start + 1, start + 2, start + 3]);
	target.uvs.push(0, previous[left].v, 1, previous[right].v,
		1, current[right].v, 0, current[left].v);
}
