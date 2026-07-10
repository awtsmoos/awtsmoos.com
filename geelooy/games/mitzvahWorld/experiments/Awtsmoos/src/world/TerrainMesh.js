// B"H
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../light-three-gltf/tiny-runtime.js';
import {
	REPEAT_HOOKS,
	terrainRepeat,
	textureSize
} from '../assets/TextureRepeat.js';

/** Creates one terrain draw call with equal-frequency grass and dirt sampling. */
export function createTerrainMesh(data, grassImage, dirtImage, fallbackUrl) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		data.vertices.flatMap((point) => [point.x, point.y, point.z])
	), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	const repeat = terrainRepeat(data.size, grassImage);
	const material = new MeshStandardMaterial({
		name: 'Awtsmoos-grass-and-dirt-patch-terrain',
		color: [1, 1, 1, 1]
	});
	Object.assign(material, {
		mapImage: grassImage,
		mixImage: dirtImage,
		mapRepeat: repeat,
		mixRepeat: [...repeat],
		mixStrength: 0.62,
		mixPatchScale: 0.027,
		mixPatchSharpness: 0.55,
		textureUrl: grassImage?.src || fallbackUrl,
		mixTextureUrl: dirtImage?.dataset?.publicUrl
			|| dirtImage?.dataset?.url
			|| dirtImage?.src
			|| null,
		anisotropy: 2,
		texturePolicy: {
			fullResolution: true,
			repeatMode: 'mirror-pingpong',
			mix: 'world-space-dirt-patches',
			sameRepeatForBothTextures: true,
			sourcePixels: textureSize(grassImage),
			texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld
		}
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'eretz-grass-with-dirt-patches';
	mesh.setBaseTransform();
	return mesh;
}
