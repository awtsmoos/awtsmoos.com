// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

const TOPOLOGY_ARITY = Object.freeze({
	triangles: 3,
	lines: 2
});

/**
 * Validates cross-field geometry invariants after declarations are normalized.
 *
 * @param {object} geometry Partial normalized geometry.
 */
export function assertGeometryInvariants(geometry) {
	const position = geometry.attributes.position;
	const vertexCount = position
		? position.array.length / position.itemSize
		: null;
	validateAttributeCounts(geometry.attributes, vertexCount, "attributes");
	validateAttributeCounts(
		geometry.morphTargets,
		vertexCount,
		"morphTargets",
		true
	);
	validateIndices(geometry.indices, vertexCount, geometry.topology);
	const elementCount = geometry.indices?.array.length ?? vertexCount ?? 0;
	validateRange(geometry.drawRange, elementCount, "drawRange");
	for (const [index, group] of geometry.groups.entries()) {
		validateRange(group, elementCount, `groups/${index}`);
	}
}

function validateAttributeCounts(attributes, vertexCount, path, nested = false) {
	if (vertexCount == null) {
		return;
	}
	const entries = nested
		? Object.entries(attributes).flatMap(([target, values]) => (
			Object.entries(values).map(([name, value]) => [
				`${target}/${name}`,
				value
			])
		))
		: Object.entries(attributes);
	for (const [name, attribute] of entries) {
		if (
			attribute.domain === "vertex"
			&& attribute.array.length / attribute.itemSize !== vertexCount
		) {
			throw new Error(
				`B"H | ${path}/${name} vertex count does not match position.`
			);
		}
	}
}

function validateIndices(indices, vertexCount, topology) {
	if (!indices) {
		return;
	}
	if (vertexCount != null) {
		const maximum = Math.max(-1, ...indices.array);
		if (maximum >= vertexCount) {
			throw new Error('B"H | Geometry index exceeds the vertex count.');
		}
	}
	const arity = TOPOLOGY_ARITY[topology];
	if (arity && indices.array.length % arity !== 0) {
		throw new Error(`B"H | ${topology} indices require groups of ${arity}.`);
	}
}

function validateRange(range, elementCount, path) {
	if (!range) {
		return;
	}
	const start = Number(range.start ?? 0);
	const count = range.count == null ? elementCount - start : Number(range.count);
	if (
		!Number.isInteger(start)
		|| !Number.isInteger(count)
		|| start < 0
		|| count < 0
		|| start + count > elementCount
	) {
		throw new Error(`B"H | ${path} exceeds available geometry elements.`);
	}
}
