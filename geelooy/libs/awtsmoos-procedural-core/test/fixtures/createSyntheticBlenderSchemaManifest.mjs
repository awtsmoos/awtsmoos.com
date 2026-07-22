// B"H
// Boruch Hashem
// Blessed is He
/** Synthetic Blender universes exercise nodes, sockets, properties, zones, and modifiers. */

function socket(identifier, nativeType, options = {}) {
	return { identifier, name: options.name ?? identifier, nativeType, ...options };
}

function property(identifier, rnaType, options = {}) {
	return { identifier, name: options.name ?? identifier, rnaType, ...options };
}

function shaderNodes(version) {
	const principled = {
		nativeType: "ShaderNodeBsdfPrincipled",
		name: "Principled BSDF",
		inputs: [
			socket("Base Color", "NodeSocketColor", { defaultValue: [0.8, 0.8, 0.8, 1] }),
			socket("Roughness", "NodeSocketFloatFactor", { subtype: "FACTOR", defaultValue: 0.5 })
		],
		outputs: [socket("BSDF", "NodeSocketShader", { shaderFamily: "surface" })],
		properties: [property("distribution", "ENUM", {
			defaultValue: version === "5.1.0" ? "MULTI_GGX" : "GGX",
			enumItems: [
				{ identifier: "GGX", name: "GGX", value: 0 },
				{ identifier: "MULTI_GGX", name: "Multiscatter GGX", value: 1 }
			]
		})]
	};
	const nodes = [principled, {
		nativeType: "ShaderNodeOutputMaterial",
		name: "Material Output",
		inputs: [socket("Surface", "NodeSocketShader", { shaderFamily: "surface" })],
		outputs: [],
		properties: []
	}];
	if (version === "5.2.0") nodes.push({
		nativeType: "ShaderNodeRayPortalBSDF",
		name: "Ray Portal BSDF",
		inputs: [socket("Color", "NodeSocketColor")],
		outputs: [socket("BSDF", "NodeSocketShader", { shaderFamily: "surface" })],
		properties: []
	});
	return nodes;
}

function geometryNodes(version) {
	return [{
		nativeType: "GeometryNodeJoinGeometry",
		name: "Join Geometry",
		inputs: [socket("Geometry", "NodeSocketGeometry", {
			multiInput: true,
			linkLimit: 4095
		})],
		outputs: [socket("Geometry", "NodeSocketGeometry")],
		properties: []
	}, {
		nativeType: "GeometryNodeMysteryField",
		name: "Mystery Field",
		inputs: [socket("Mystery", "NodeSocketFutureQuantum", { fieldCapable: true })],
		outputs: [socket("Value", "NodeSocketFloat", { fieldCapable: true })],
		properties: [property("mode", "ENUM", {
			enumItems: [{ identifier: version === "5.1.0" ? "OLD" : "NEW", name: "Mode", value: 0 }]
		})],
		opaque: true
	}];
}

export function createSyntheticBlenderSchemaManifest(version = "5.1.0", reverse = false) {
	const treeTypes = [{
		nativeType: "ShaderNodeTree",
		name: "Shader",
		category: "shader",
		nodes: shaderNodes(version)
	}, {
		nativeType: "GeometryNodeTree",
		name: "Geometry",
		category: "geometry",
		nodes: geometryNodes(version)
	}];
	const modifiers = [{
		nativeType: "ArrayModifier",
		name: "Array",
		category: "generate",
		domains: ["geometry", "object"],
		properties: [property("count", "INT", { defaultValue: version === "5.1.0" ? 2 : 3, minimum: 1 })]
	}];
	if (version === "5.2.0") modifiers.push({
		nativeType: "GreasePencilDashModifier",
		name: "Dash",
		category: "generate",
		domains: ["geometry", "object"],
		properties: []
	});
	const manifest = {
		blenderVersion: version,
		buildHash: `build-${version}`,
		buildBranch: "main",
		buildPlatform: "synthetic",
		exporterVersion: "1.0.0",
		treeTypes,
		modifiers,
		interfaces: [{ id: "NodeTreeInterfaceSocketFloat", nativeType: "NodeTreeInterfaceSocketFloat" }],
		zones: [{ id: "GeometryNodeTree:GeometryNodeSimulationInput", role: "simulation-input" }],
		aliases: version === "5.2.0" ? [{ from: "ShaderNodeOldPortal", to: "ShaderNodeRayPortalBSDF", kind: "node" }] : [],
		diagnostics: [{ code: "NODE.INSTANTIATE_FAILED", nativeType: "LegacyNode", message: "Synthetic omission" }]
	};
	if (!reverse) return manifest;
	return {
		...manifest,
		treeTypes: [...treeTypes].reverse().map(tree => ({
			...tree,
			nodes: [...tree.nodes].reverse()
		})),
		modifiers: [...modifiers].reverse()
	};
}
