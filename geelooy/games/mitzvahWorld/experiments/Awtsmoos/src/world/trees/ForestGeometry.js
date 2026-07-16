// B"H
/**
 * @file ForestGeometry.js
 * @description Merges every tree into fast bark and transparent leaf vessels.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { WORLD_MATERIAL_PRESETS } from '../../assets/TextureCatalog.js';
import { createForestLeafTexture } from './ForestLeafTexture.js';

function rgba(value) {
	if (Array.isArray(value)) return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
	const number = Number(value);
	if (!Number.isFinite(number)) return [1, 1, 1, 1];
	return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255, 1];
}

export function transformTreePoint(position, record) {
	const cosine = Math.cos(record.rotationY);
	const sine = Math.sin(record.rotationY);
	const x = position[0] * record.scale;
	const z = position[2] * record.scale;
	return {
		x: record.x + x * cosine + z * sine,
		y: record.y + position[1] * record.scale,
		z: record.z - x * sine + z * cosine
	};
}

function transformNormal(normal, rotationY) {
	const cosine = Math.cos(rotationY);
	const sine = Math.sin(rotationY);
	return [normal[0] * cosine + normal[2] * sine, normal[1], -normal[0] * sine + normal[2] * cosine];
}

function append(builder, geometry, record, fallbackColor) {
	const offset = builder.positions.length / 3;
	for (let index = 0; index < geometry.positions.length; index += 3) {
		const point = transformTreePoint(geometry.positions.slice(index, index + 3), record);
		const vertex = index / 3;
		const colorOffset = vertex * 4;
		builder.positions.push(point.x, point.y, point.z);
		builder.normals.push(...transformNormal(geometry.normals.slice(index, index + 3), record.rotationY));
		builder.uvs.push(geometry.uvs[vertex * 2], geometry.uvs[vertex * 2 + 1]);
		builder.colors.push(...(geometry.colors?.length ? geometry.colors.slice(colorOffset, colorOffset + 4) : fallbackColor));
	}
	for (const index of geometry.indices) builder.indices.push(index + offset);
}

function meshFromBuilder(name, builder, material) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(builder.positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(builder.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(builder.uvs), 2));
	geometry.setAttribute('color', new BufferAttribute(new Float32Array(builder.colors), 4));
	geometry.setIndex(new BufferAttribute(indexArray(builder.indices), 1));
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.userData.AwtsmoosForestLayer = material.userData.AwtsmoosForestMaterial;
	mesh.setBaseTransform();
	return mesh;
}

function indexArray(indices) {
	let maximum = 0;
	for (const index of indices) maximum = Math.max(maximum, index);
	return maximum > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

function emptyBuilder() {
	return { positions: [], normals: [], uvs: [], colors: [], indices: [] };
}

function forestMaterials() {
	const barkUrls = WORLD_MATERIAL_PRESETS.forestBark;
	const leafUrls = WORLD_MATERIAL_PRESETS.forestLeaves;
	const barkMap = cachedTextureImage(barkUrls[0]);
	const leafMap = cachedTextureImage(leafUrls[0]) || createForestLeafTexture();
	const bark = new MeshStandardMaterial({
		name: 'Awtsmoos_forest_bark_real_public_firebase_fast',
		color: [1, 1, 1, 1]
	});
	Object.assign(bark, {
		mapImage: barkMap,
		textureUrl: barkUrls[0],
		mapRepeat: [4, 9],
		anisotropy: 4,
		texturePolicy: {
			publicFirebase: true,
			realMapImage: !!barkMap,
			candidates: barkUrls,
			fastLighting: 'single-merged-bark-draw-call-with-real-public-texture'
		},
		userData: { AwtsmoosForestMaterial: { layer: 'bark', merged: true, drawCalls: 1, realMapImage: !!barkMap, publicUrls: barkUrls } }
	});
	const leaves = new MeshStandardMaterial({
		name: 'Awtsmoos_forest_leaves_real_transparent_public_firebase_fast',
		color: [1, 1, 1, 1],
		alphaMode: 'MASK',
		alphaCutoff: 0.2,
		doubleSided: true
	});
	Object.assign(leaves, {
		mapImage: leafMap,
		textureUrl: leafUrls[0],
		mapRepeat: [1, 1],
		anisotropy: 4,
		transparent: true,
		texturePolicy: {
			publicFirebase: true,
			shader: 'leaf-cluster-alpha-wind',
			realMapImage: !!cachedTextureImage(leafUrls[0]),
			candidates: leafUrls,
			fallbackMaskOnlyIfImageMissing: true,
			alpha: 'transparent-cropped-cutout-required'
		},
		userData: { AwtsmoosForestMaterial: { layer: 'leaves', merged: true, drawCalls: 1, transparent: true, realMapImage: !!cachedTextureImage(leafUrls[0]), publicUrls: leafUrls } }
	});
	return { bark, leaves };
}

export function createMergedForestGeometry(records) {
	const branches = emptyBuilder();
	const leaves = emptyBuilder();
	for (const record of records) {
		append(branches, record.tree.branches, record, rgba(record.tree.branches.material?.tint));
		append(leaves, record.tree.leaves, record, rgba(record.tree.leaves.material?.tint));
	}
	const materials = forestMaterials();
	const group = new Group();
	group.name = 'Awtsmoos_procedural_forest_all_presets_real_public_materials';
	group.add(meshFromBuilder('Awtsmoos_forest_merged_real_bark', branches, materials.bark));
	group.add(meshFromBuilder('Awtsmoos_forest_merged_real_transparent_leaves', leaves, materials.leaves));
	return {
		group,
		stats: {
			drawCalls: 2,
			branchVertices: branches.positions.length / 3,
			leafVertices: leaves.positions.length / 3,
			triangles: (branches.indices.length + leaves.indices.length) / 3,
			alphaCutout: true,
			transparentLeaves: true,
			publicFirebaseMaterials: true,
			realBarkMapImage: !!materials.bark.mapImage,
			realLeafMapImage: !!cachedTextureImage(WORLD_MATERIAL_PRESETS.forestLeaves[0]),
			leafTextureCandidates: WORLD_MATERIAL_PRESETS.forestLeaves,
			barkTextureCandidates: WORLD_MATERIAL_PRESETS.forestBark
		}
	};
}

export default createMergedForestGeometry;
