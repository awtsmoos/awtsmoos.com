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

/** Converts terrain data into one grass draw call. */
export function createTerrainMesh(data, grassImage, fallbackUrl) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(
		data.vertices.flatMap((point) => [point.x, point.y, point.z])
	), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	const material = new MeshStandardMaterial({
		name: 'Awtsmoos-readable-full-resolution-grass',
		color: [1, 1, 1, 1]
	});
	Object.assign(material, {
		mapImage: grassImage,
		mixImage: null,
		mapRepeat: terrainRepeat(data.size, grassImage),
		mixRepeat: [1, 1],
		mixStrength: 0,
		textureUrl: grassImage?.src || fallbackUrl,
		anisotropy: 2,
		texturePolicy: {
			fullResolution: true,
			repeatMode: 'mirror-pingpong',
			mix: 'disabled',
			sourcePixels: textureSize(grassImage),
			texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld
		}
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'eretz-full-resolution-grass-only';
	mesh.setBaseTransform();
	return mesh;
}
