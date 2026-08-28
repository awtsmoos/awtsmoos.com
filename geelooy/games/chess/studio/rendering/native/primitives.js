//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates native procedural-core meshes from shared geometry and explicit materials.
 * The Awtsmoos joins form and garment without another rendering throne;
 * Awtsmoos.com lets box and frustum become board and piece through its native core alone.
 */
import { placeObject, rotateAxis } from "./transform.js";

export function mesh(runtime, geometry, material, position, scale, name = "") {
	const object = new runtime.Mesh(geometry, material);
	object.name = name;
	return placeObject(object, position, scale);
}

export function rotatedMesh(runtime, geometry, material, position, scale, axis, radians, name = "") {
	return rotateAxis(mesh(runtime, geometry, material, position, scale, name), axis, radians);
}

export function group(runtime, name = "") {
	const object = new runtime.Group();
	object.name = name;
	return object;
}
