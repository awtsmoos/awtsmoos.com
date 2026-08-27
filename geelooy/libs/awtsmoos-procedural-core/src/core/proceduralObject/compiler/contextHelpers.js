// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export function requireGeometry(context, id) {
	const geometry = context.geometries.get(id);
	if (!geometry) {
		throw new Error(`B"H | Missing source geometry: ${id}`);
	}
	return geometry;
}

export function requireObject(context, id) {
	const object = context.objects.get(id);
	if (!object) {
		throw new Error(`B"H | Missing source object: ${id}`);
	}
	return object;
}

export function storeGeometry(context, command, geometry) {
	const stored = Object.freeze({
		...geometry,
		id: command.target,
		sourceCommandId: command.id
	});
	context.geometries.set(command.target, stored);
	return stored;
}

export function storeObject(context, command, object) {
	const stored = Object.freeze({
		...object,
		id: command.target,
		sourceCommandId: command.id
	});
	context.objects.set(command.target, stored);
	return stored;
}
