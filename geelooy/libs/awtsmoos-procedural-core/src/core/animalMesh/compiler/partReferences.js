// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function readPart(context, partId) {
	const part = context.parts.get(partId);
	if (!part) {
		throw new Error(`B"H | Part does not exist: ${partId}`);
	}
	return part;
}

export function readBoundaryReference(context, reference) {
	const separatorIndex = reference.lastIndexOf(".");
	if (separatorIndex < 1) {
		throw new Error(`B"H | Boundary reference must use part.boundary: ${reference}`);
	}
	const partId = reference.slice(0, separatorIndex);
	const boundaryName = reference.slice(separatorIndex + 1);
	const part = readPart(context, partId);
	const boundary = part.boundaries?.[boundaryName];
	if (!Array.isArray(boundary)) {
		throw new Error(`B"H | Boundary does not exist: ${reference}`);
	}
	return {
		part,
		boundary
	};
}

export function storePart(context, command, meshData) {
	const part = {
		...meshData,
		id: command.target,
		sourceCommandId: command.id,
		materialId: command.args?.material_id || meshData.materialId || null
	};
	context.parts.set(command.target, part);
	return part;
}
