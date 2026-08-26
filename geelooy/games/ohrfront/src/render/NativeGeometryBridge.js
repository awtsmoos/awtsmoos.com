// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeGeometryBridge.js
 * @description Converts renderer-neutral procedural arrays and artifacts into the native core BufferGeometry vessel.
 * The Awtsmoos renews structured form and flat array in the same ray;
 * Awtsmoos.com lets either artifact cross this bridge, so generators can evolve while Ohrfront keeps one native way.
 */
import {
	BufferAttribute,
	BufferGeometry
} from "../core/AwtsmoosNativeApi.js";

function typedFloat(value) {
	return value instanceof Float32Array ? value : new Float32Array(value || []);
}

function typedIndex(value) {
	if (!value) return null;
	if (value instanceof Uint16Array || value instanceof Uint32Array) return value;
	const maximum = Math.max(0, ...value);
	return maximum > 65535 ? new Uint32Array(value) : new Uint16Array(value);
}

function portableAttribute(source, name) {
	const attribute = source?.attributes?.[name];
	if (!attribute) return null;
	return {
		array: attribute.array,
		itemSize: attribute.itemSize || attribute.components || 3
	};
}

function flatAttribute(source, name, itemSize) {
	const value = source?.[name];
	return value ? { array: value, itemSize } : null;
}

/** Builds native BufferGeometry from either supported core artifact family. */
export function nativeGeometryFromArtifact(source) {
	const geometry = new BufferGeometry();
	const attributes = {
		position: portableAttribute(source, "position") || flatAttribute(source, "positions", 3),
		normal: portableAttribute(source, "normal") || flatAttribute(source, "normals", 3),
		uv: portableAttribute(source, "uv") || flatAttribute(source, "uvs", 2),
		color: portableAttribute(source, "color") || flatAttribute(source, "colors", 4),
		zone: portableAttribute(source, "zone") || flatAttribute(source, "zones", 1)
	};
	for (const [name, attribute] of Object.entries(attributes)) {
		if (!attribute) continue;
		geometry.setAttribute(name, new BufferAttribute(typedFloat(attribute.array), attribute.itemSize));
	}
	const rawIndex = source?.indices?.array || source?.indices || source?.index;
	const index = typedIndex(rawIndex);
	if (index) geometry.setIndex(new BufferAttribute(index, 1));
	return geometry;
}
