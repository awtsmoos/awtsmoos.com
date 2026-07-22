// B"H
// Boruch Hashem
// Blessed is He
/** Catalog sockets preserve Blender names while entering universal typed algebra. */

const NATIVE_TYPES = Object.freeze({
	boolean: "NodeSocketBool", integer: "NodeSocketInt", float: "NodeSocketFloat",
	angle: "NodeSocketFloatAngle", distance: "NodeSocketFloatDistance",
	factor: "NodeSocketFloatFactor", vector: "NodeSocketVector",
	rotation: "NodeSocketRotation", color: "NodeSocketColor",
	string: "NodeSocketString", geometry: "NodeSocketGeometry",
	material: "NodeSocketMaterial", object: "NodeSocketObject",
	collection: "NodeSocketCollection", image: "NodeSocketImage",
	shader: "NodeSocketShader", volume: "NodeSocketShader",
	displacement: "NodeSocketVector", menu: "NodeSocketMenu"
});

/** Creates a manifest-compatible typed Blender socket declaration. */
export function catalogSocket(identifier, type, options = {}) {
	return Object.freeze({
		identifier,
		name: options.name ?? identifier,
		nativeType: options.nativeType ?? NATIVE_TYPES[type] ?? "NodeSocketVirtual",
		subtype: options.subtype ?? (type === "angle" ? "ANGLE" : null),
		fieldCapable: options.fieldCapable === true,
		multiInput: options.multiInput === true,
		defaultValue: options.defaultValue ?? null,
		metadata: Object.freeze({ semanticType: type, ...(options.metadata ?? {}) })
	});
}

/** Creates a manifest-compatible native node declaration. */
export function catalogNode(nativeType, category, inputs = [], outputs = [], metadata = {}) {
	return Object.freeze({
		nativeType,
		name: metadata.title ?? nativeType,
		category,
		inputs: Object.freeze(inputs),
		outputs: Object.freeze(outputs),
		properties: Object.freeze(metadata.properties ?? []),
		zoneRole: metadata.zoneRole ?? null,
		metadata: Object.freeze({
			family: metadata.family ?? category,
			nativeSemantics: metadata.nativeSemantics === true,
			implementation: metadata.implementation ?? "adapter-dependent",
			minimumBlenderVersion: metadata.minimumBlenderVersion ?? "4.0.0"
		})
	});
}
