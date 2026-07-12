// B"H
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../light-three-gltf/tiny-runtime.js';
import { WORLD_MATERIAL_PRESETS, TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../assets/TextureRepeat.js';

/** Creates one terrain draw call with valley-aware multi-material shader metadata. */
export function createTerrainMesh(data, grassImage, dirtImage, fallbackUrl) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		data.vertices.flatMap((point) => [point.x, point.y, point.z])
	), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setAttribute('zone', new BufferAttribute(new Float32Array(zoneWeights(data.zones)), 4));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const repeat = terrainRepeat(data.size, grassImage);
	const material = new MeshStandardMaterial({
		name: 'Awtsmoos_hyper_real_valley_multi_material_terrain',
		color: [1, 1, 1, 1]
	});
	Object.assign(material, {
		mapImage: grassImage,
		mixImage: dirtImage,
		mapRepeat: repeat,
		mixRepeat: [...repeat],
		mixStrength: 0.74,
		mixPatchScale: 0.019,
		mixPatchSharpness: 0.68,
		textureUrl: grassImage?.src || fallbackUrl,
		mixTextureUrl: dirtImage?.dataset?.publicUrl || dirtImage?.dataset?.url || dirtImage?.src || TEXTURE_URLS.terrain.dirtGrass3,
		anisotropy: 4,
		texturePolicy: {
			publicFirebase: true,
			fullResolution: true,
			repeatMode: 'mirror-pingpong',
			mix: 'world-space-valley-multi-zone-mix',
			sameRepeatForBothTextures: true,
			sourcePixels: textureSize(grassImage),
			texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
			materials: {
				grass: WORLD_MATERIAL_PRESETS.terrainMix,
				mud: TEXTURE_URLS.terrain.mud,
				marsh: TEXTURE_URLS.terrain.marshGrass,
				shore: TEXTURE_URLS.terrain.sand1,
				forestFloor: TEXTURE_URLS.terrain.darkForestFloor
			},
			zones: {
				lakeBasin: 'mud + marsh + sand shore wetness',
				streamChannel: 'mud + marsh edge + flowing-water overlay',
				villagePlaza: 'short grass worn with dirt paths',
				distantHills: 'grass and forest-floor blend'
			}
		}
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'Awtsmoos_hyper_real_valley_terrain_textured';
	mesh.userData.AwtsmoosTerrainValley = data.AwtsmoosTerrainValley;
	mesh.setBaseTransform();
	return mesh;
}

function zoneWeights(zones = []) {
	const weights = [];
	for (const zone of zones) {
		weights.push(...zoneToWeight(zone));
	}
	return weights;
}

function zoneToWeight(zone) {
	if (zone === 'lake-basin') return [0, 1, 0, 0];
	if (zone === 'stream-channel') return [0, 0, 1, 0];
	if (zone === 'village-plaza') return [1, 0, 0, 0.45];
	if (zone === 'distant-hills') return [0.65, 0, 0, 1];
	return [1, 0, 0, 0];
}

function indexArray(indices) {
	return dataMaximum(indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

function dataMaximum(indices) {
	let maximum = 0;
	for (const index of indices) maximum = Math.max(maximum, index);
	return maximum;
}
