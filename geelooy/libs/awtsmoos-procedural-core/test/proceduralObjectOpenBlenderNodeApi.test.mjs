// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { createOpenBlenderNodeApiSurface } from "../src/core/proceduralObject/nodeSystem/native/index.js";

function byNativeType(surface, nativeType) {
	return surface.blenderPack.definitions.find(
		(definition) => definition.metadata.nativeType === nativeType
	);
}

function socketReference(definition, socketId) {
	return { nodeType: definition.type, socketId };
}

test("open Blender API represents every built-in manifest node", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const parity = surface.createParityMatrix();
	assert.equal(surface.counts.blender, 73);
	assert.ok(surface.counts.native >= 200);
	assert.equal(surface.counts.total, surface.counts.blender + surface.counts.native);
	assert.equal(parity.counts.total, surface.counts.blender);
	assert.equal(parity.counts.represented, parity.counts.total);
	assert.equal(parity.missingRepresentation.length, 0);
	assert.ok(parity.counts.nativeContracts > 0);
	assert.equal(parity.counts.executable, 0);
	for (const definition of surface.blenderPack.definitions) {
		assert.equal(surface.registry.has(definition.type), true);
	}
});

test("Blender principled surface connects to material output exactly", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const principled = byNativeType(surface, "ShaderNodeBsdfPrincipled");
	const output = byNativeType(surface, "ShaderNodeOutputMaterial");
	const connection = surface.planConnection({
		from: socketReference(principled, "bsdf"),
		to: socketReference(output, "surface")
	});
	assert.equal(connection.compatible, true);
	assert.equal(connection.conversion, "identity");
	assert.equal(connection.lossiness, "none");
});

test("Blender noise factor connects to principled roughness", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const noise = byNativeType(surface, "ShaderNodeTexNoise");
	const principled = byNativeType(surface, "ShaderNodeBsdfPrincipled");
	const connection = surface.planConnection({
		from: socketReference(noise, "factor"),
		to: socketReference(principled, "roughness")
	});
	assert.equal(connection.compatible, true);
	assert.equal(connection.conversion, "identity");
	assert.equal(connection.lossiness, "none");
});

test("Blender geometry multi-input preserves append semantics", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const cube = byNativeType(surface, "GeometryNodeMeshCube");
	const boolean = byNativeType(surface, "GeometryNodeMeshBoolean");
	const connection = surface.planConnection({
		from: socketReference(cube, "mesh"),
		to: socketReference(boolean, "mesh-2")
	});
	assert.equal(connection.compatible, true);
	assert.equal(connection.conversion, "identity");
	assert.equal(connection.to.multiInput, true);
	assert.equal(connection.connectionPolicy, "append-in-stable-link-order");
});

test("cross-domain geometry to shader connection is rejected", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const cube = byNativeType(surface, "GeometryNodeMeshCube");
	const output = byNativeType(surface, "ShaderNodeOutputMaterial");
	const connection = surface.planConnection({
		from: socketReference(cube, "mesh"),
		to: socketReference(output, "surface")
	});
	assert.equal(connection.compatible, false);
	assert.equal(connection.conversion, null);
	assert.match(
		connection.reason,
		/shader closures|exact family|generic shader boundary/i
	);
});
