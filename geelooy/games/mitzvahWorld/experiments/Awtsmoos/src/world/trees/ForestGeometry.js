// B"H
/**
 * @file ForestGeometry.js
 * @description Merges every tree into fast bark and opaque-pass MASK leaf vessels.
 */
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { runtimeMaterialByRole } from '../../assets/RuntimeMaterialManifest.js';
import {
	createForestLeafPublicTexture,
	createForestLeafTexture
} from './ForestLeafTexture.js';

const FOREST_LEAF_ROLES = Object.freeze([
	'forest.chaiOak',
	'forest.chaiAsh',
	'forest.chaiAspen',
	'forest.chaiPine'
]);

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

function materialUrls(role) {
	const material = runtimeMaterialByRole(role);
	return material ? [material.primaryUrl, ...material.fallbackUrls] : [];
}

function forestMaterials() {
	const barkRole = runtimeMaterialByRole('forest.bark');
	const barkUrls = materialUrls('forest.bark');
	const leafUrls = [...new Set(FOREST_LEAF_ROLES.flatMap(materialUrls))];
	const barkMap = cachedTextureImage(barkUrls[0]);
	const publicLeafSource = cachedTextureImage(leafUrls[0]);
	const realLeafMap = createForestLeafPublicTexture(publicLeafSource);
	const proceduralLeafMap = realLeafMap ? null : createForestLeafTexture();
	const leafMap = realLeafMap || proceduralLeafMap;
	const bark = new MeshStandardMaterial({
		name: 'Awtsmoos_forest_bark_real_public_firebase_fast',
		color: [1, 1, 1, 1]
	});
	Object.assign(bark, {
		mapImage: barkMap,
		textureUrl: barkUrls[0],
		mapRepeat: barkRole?.repeat || [3, 8],
		anisotropy: 4,
		texturePolicy: {
			publicFirebase: true,
			realMapImage: !!barkMap,
			candidates: barkUrls,
			fastLighting: 'single-merged-bark-draw-call-with-licensed-pot-public-texture'
		},
		userData: {
			AwtsmoosForestMaterial: {
				layer: 'bark',
				merged: true,
				drawCalls: 1,
				realMapImage: !!barkMap,
				publicUrls: barkUrls
			}
		}
	});
	const leaves = new MeshStandardMaterial({
		name: 'Awtsmoos_forest_leaves_real_mask_public_firebase_fast',
		color: [1, 1, 1, 1],
		alphaMode: 'MASK',
		alphaCutoff: 0.22,
		transparent: false,
		doubleSided: true
	});
	Object.assign(leaves, {
		mapImage: leafMap,
		mapImageFallback: !realLeafMap && !!proceduralLeafMap,
		textureUrl: leafUrls[0],
		mapRepeat: [1, 1],
		anisotropy: 4,
		depthWrite: true,
		texturePolicy: {
			publicFirebase: true,
			shader: 'leaf-cluster-alpha-wind',
			realMapImage: !!realLeafMap,
			candidates: leafUrls,
			fallbackMaskOnlyIfImageMissing: true,
			proceduralFallbackActive: !realLeafMap && !!proceduralLeafMap,
			hydrateMapImage: createForestLeafPublicTexture,
			publicTextureTransform: 'chai-leaf-background-to-alpha-mask',
			publicLeafBackgroundRgb: [72, 108, 85],
			alpha: 'mask-cutout-opaque-pass-depth-writing'
		},
		userData: {
			AwtsmoosForestMaterial: {
				layer: 'leaves',
				merged: true,
				drawCalls: 1,
				transparent: false,
				depthWrite: true,
				realMapImage: !!realLeafMap,
				proceduralFallback: !realLeafMap && !!proceduralLeafMap,
				publicTextureTransform: 'chai-leaf-background-to-alpha-mask',
				publicUrls: leafUrls
			}
		}
	});
	return { bark, leaves, barkUrls, leafUrls, realLeafMap, proceduralLeafMap };
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
	group.add(meshFromBuilder('Awtsmoos_forest_merged_real_mask_leaves', leaves, materials.leaves));
	return {
		group,
		stats: {
			drawCalls: 2,
			branchVertices: branches.positions.length / 3,
			leafVertices: leaves.positions.length / 3,
			triangles: (branches.indices.length + leaves.indices.length) / 3,
			alphaCutout: true,
			transparentLeaves: false,
			depthWritingLeaves: true,
			publicFirebaseMaterials: true,
			realBarkMapImage: !!materials.bark.mapImage,
			realLeafMapImage: !!materials.realLeafMap,
			proceduralLeafFallback: !!materials.proceduralLeafMap,
			leafTextureCandidates: materials.leafUrls,
			barkTextureCandidates: materials.barkUrls
		}
	};
}

export default createMergedForestGeometry;
