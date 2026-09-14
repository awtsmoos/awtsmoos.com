//B"H
//Boruch Hashem
//Blessed be He

const TYPES = Object.freeze({
	float: type(0x1406, 1, "float"), vec2: type(0x8b50, 2, "float"), vec3: type(0x8b51, 3, "float"), vec4: type(0x8b52, 4, "float"),
	int: type(0x1404, 1, "int"), ivec2: type(0x8b53, 2, "int"), ivec3: type(0x8b54, 3, "int"), ivec4: type(0x8b55, 4, "int"),
	uint: type(0x1405, 1, "uint"), uvec2: type(0x8dc6, 2, "uint"), uvec3: type(0x8dc7, 3, "uint"), uvec4: type(0x8dc8, 4, "uint"),
	bool: type(0x8b56, 1, "int"), bvec2: type(0x8b57, 2, "int"), bvec3: type(0x8b58, 3, "int"), bvec4: type(0x8b59, 4, "int"),
	mat2: type(0x8b5a, 4, "float"), mat3: type(0x8b5b, 9, "float"), mat4: type(0x8b5c, 16, "float"),
	mat2x3: type(0x8b65, 6, "float"), mat2x4: type(0x8b66, 8, "float"), mat3x2: type(0x8b67, 6, "float"),
	mat3x4: type(0x8b68, 12, "float"), mat4x2: type(0x8b69, 8, "float"), mat4x3: type(0x8b6a, 12, "float"),
	sampler2D: type(0x8b5e, 1, "int"), samplerCube: type(0x8b60, 1, "int")
});

/** Returns GLES enum, scalar width, and query-kind metadata for one GLSL ES type. */
export function nativeGlesGlslTypeInfo(name) {
	return TYPES[String(name || "")] || null;
}

/** Creates one immutable GLSL type metadata record. */
function type(enumeration, width, queryKind) {
	return Object.freeze({ enumeration, queryKind, width });
}
