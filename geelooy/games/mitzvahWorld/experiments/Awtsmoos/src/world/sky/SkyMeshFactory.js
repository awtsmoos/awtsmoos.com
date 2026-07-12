// B"H
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { normalize, v } from '../../math/Geometry3D.js';
/** Creates one sky mesh whose public URL and real cached Image remain inseparable. */
export function createSkyMesh(name, geometryData, materialData) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(geometryData.positions, 3));
	geometry.setAttribute('normal', attribute(geometryData.normals, 3));
	geometry.setAttribute('color', attribute(geometryData.colors, 4));
	if (geometryData.uvs?.length) geometry.setAttribute('uv', attribute(geometryData.uvs, 2));
	geometry.setIndex(new BufferAttribute(indexArray(geometryData.indices), 1));
	const alpha = materialData.color[3] ?? 1;
	const material = new MeshStandardMaterial({ name, color: materialData.color });
	Object.assign(material, {
		textureUrl: materialData.textureUrl,
		mapImage: cachedTextureImage(materialData.textureUrl),
		mapRepeat: materialData.mapRepeat || [1, 1],
		transparent: alpha < 1,
		opacity: alpha,
		alphaMode: alpha < 1 ? 'BLEND' : 'OPAQUE',
		doubleSided: materialData.doubleSided !== false,
		texturePolicy: materialData.texturePolicy || null
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.setBaseTransform();
	return mesh;
}
/** Creates a camera-facing atmospheric rectangle with explicit UV coordinates. */
export function createSkyQuad(name, center, size, color, textureUrl) {
	const [x, y, z] = center;
	const [width, height] = size;
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	return createSkyMesh(name, {
		positions: [
			x - halfWidth, y - halfHeight, z,
			x + halfWidth, y - halfHeight, z,
			x + halfWidth, y + halfHeight, z,
			x - halfWidth, y + halfHeight, z
		],
		normals: repeatVector([0, 0, 1], 4),
		colors: repeatVector(color, 4),
		uvs: [0, 0, 1, 0, 1, 1, 0, 1],
		indices: [0, 1, 2, 0, 2, 3]
	}, { color, textureUrl });
}
/** Creates one sun disc whose radial UVs preserve the luminous source texture. */
export function createSkyDisc(name, center, radius, color, textureUrl) {
	const middle = v(...center);
	const normal = normalize(v(-center[0], -center[1], -center[2]));
	const right = normalize(v(normal.z, 0, -normal.x));
	const up = normalize(v(
		normal.y * right.z,
		normal.z * right.x - normal.x * right.z,
		-normal.y * right.x
	));
	const data = discGeometry(middle, normal, right, up, radius, color);
	return createSkyMesh(name, data, { color, textureUrl });
}
/** Creates one tapered golden ray with a cache-bound public material. */
export function createSkyRay(name, center, angle, length, width, color, textureUrl) {
	const [x, y, z] = center;
	const rayX = Math.cos(angle);
	const rayY = Math.sin(angle);
	const upX = -Math.sin(angle);
	const upY = Math.cos(angle);
	return createSkyMesh(name, {
		positions: [
			x - upX * width, y - upY * width, z,
			x + upX * width, y + upY * width, z,
			x + rayX * length + upX * width * 0.18, y + rayY * length + upY * width * 0.18, z,
			x + rayX * length - upX * width * 0.18, y + rayY * length - upY * width * 0.18, z
		],
		normals: repeatVector([0, 0, 1], 4),
		colors: [...color, ...color, color[0], color[1], color[2], 0, color[0], color[1], color[2], 0],
		uvs: [0, 0, 1, 0, 1, 1, 0, 1],
		indices: [0, 1, 2, 0, 2, 3]
	}, { color, textureUrl });
}
function discGeometry(middle, normal, right, up, radius, color) {
	const positions = [middle.x, middle.y, middle.z];
	const normals = [normal.x, normal.y, normal.z];
	const colors = [...color];
	const uvs = [0.5, 0.5];
	const indices = [];
	for (let index = 0; index <= 64; index += 1) {
		const angle = index / 64 * Math.PI * 2;
		const cosine = Math.cos(angle);
		const sine = Math.sin(angle);
		positions.push(
			middle.x + (right.x * cosine + up.x * sine) * radius,
			middle.y + (right.y * cosine + up.y * sine) * radius,
			middle.z + (right.z * cosine + up.z * sine) * radius
		);
		normals.push(normal.x, normal.y, normal.z);
		colors.push(...color);
		uvs.push(0.5 + cosine * 0.5, 0.5 + sine * 0.5);
		if (index > 0) indices.push(0, index, index + 1);
	}
	return { positions, normals, colors, uvs, indices };
}
function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}
function repeatVector(vector, count) {
	return Array.from({ length: count }, () => vector).flat();
}
function indexArray(indices) {
	return Math.max(...indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
