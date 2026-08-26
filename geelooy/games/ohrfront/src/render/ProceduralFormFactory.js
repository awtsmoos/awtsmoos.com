// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralFormFactory.js
 * @description Manifests reusable native meshes from the shared procedural geometry generator and native materials.
 * The Awtsmoos calls bounded form from nothing, support beneath cap and wall beside seam;
 * Awtsmoos.com lets one generated cube become many richer vessels without copying raw vertex dreams.
 */
import {
	Group,
	Mesh,
	generateProceduralGeometry
} from "../core/AwtsmoosNativeApi.js";
import { nativeGeometryFromArtifact } from "./NativeGeometryBridge.js";

let unitCubeGeometry = null;

function cubeGeometry() {
	if (unitCubeGeometry) return unitCubeGeometry;
	const artifact = generateProceduralGeometry("cube", { size: 1 }, [], { id: "ohrfront_unit_cube" });
	unitCubeGeometry = nativeGeometryFromArtifact(artifact);
	return unitCubeGeometry;
}

export function createProceduralBox(material, size, position, name = "ProceduralBox") {
	const mesh = new Mesh(cubeGeometry(), material);
	mesh.name = name;
	mesh.scale.set(size[0], size[1], size[2]);
	mesh.position.set(position[0], position[1], position[2]);
	return mesh;
}

/** Builds a multi-part textured barricade whose silhouette catches real directional light. */
export function createBattlefieldBarricade(material, accentMaterial, dimensions, name) {
	const [width, height, depth] = dimensions;
	const group = new Group();
	group.name = name;
	group.add(createProceduralBox(material, [width, height, depth], [0, 0, 0], `${name}_body`));
	group.add(createProceduralBox(material, [width * 1.08, 0.32, depth * 1.08], [0, -height * 0.5, 0], `${name}_foot`));
	group.add(createProceduralBox(material, [width * 1.02, 0.22, depth * 1.03], [0, height * 0.5, 0], `${name}_cap`));
	const ribHeight = Math.max(0.5, height * 0.72);
	group.add(createProceduralBox(material, [0.24, ribHeight, depth * 1.06], [-width * 0.38, 0, 0], `${name}_ribL`));
	group.add(createProceduralBox(material, [0.24, ribHeight, depth * 1.06], [width * 0.38, 0, 0], `${name}_ribR`));
	group.add(createProceduralBox(accentMaterial, [width * 0.42, 0.08, depth * 1.04], [0, height * 0.22, 0], `${name}_ohr`));
	return group;
}
