// B"H
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../light-three-gltf/tiny-runtime.js';
import { trianglesFromIndexed } from '../collision/TriangleCollider.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES, TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { proceduralData } from './ProceduralBridge.js';

const PROCEDURAL = ['manual', 'doorway', 'cylinder', 'sphere', 'triPrism'];

/** Every primitive becomes textured geometry; URL and real mapImage are both preserved. */
export function createPrimitiveMesh(definition) {
	const data = primitiveData(definition);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(flat(data.vertices)), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals(data)), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs || projectedUvs(data.vertices, definition)), 2));
	geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
	const materialSource = materialProps(definition);
	const material = new MeshStandardMaterial({
		name: definition.id,
		color: colorArray(definition.color),
		doubleSided: !!definition.doubleSided,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		opacity: definition.opacity ?? 1,
		transparent: !!definition.transparent
	});
	Object.assign(material, materialSource);
	const mesh = new Mesh(geometry, material);
	mesh.name = definition.id;
	mesh.visible = definition.visible !== false;
	mesh.userData = {
		...(definition.userData || {}),
		procedural: PROCEDURAL.includes(definition.shape),
		AwtsmoosMaterialEnforcement: material.mapImage ? 'real-mapImage-bound' : 'url-only-not-yet-loaded',
		AwtsmoosTextureUrl: material.textureUrl
	};
	mesh.setBaseTransform();
	return mesh;
}

export function primitiveColliders(definition) {
	if (definition.solid === false) return [];
	const data = primitiveData(definition);
	const floor = definition.walkable === true ? undefined : false;
	return trianglesFromIndexed(data.vertices, data.indices, { kind: definition.id, solid: true, floor });
}

function materialProps(definition) {
	const textureUrl = definition.textureUrl
		|| definition.mapImage?.dataset?.publicUrl
		|| definition.mapImage?.dataset?.url
		|| definition.mapImage?.src
		|| fallbackTexture(definition);
	const mapImage = definition.mapImage || cachedTextureImage(textureUrl) || null;
	const mixImage = definition.mixImage || cachedTextureImage(definition.mixTextureUrl) || null;
	return {
		mapImage,
		mixImage,
		textureUrl,
		mixTextureUrl: definition.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		mapRepeat: definition.mapRepeat || [1, 1],
		mixRepeat: definition.mixRepeat || definition.mapRepeat || [1, 1],
		anisotropy: definition.anisotropy ?? 3,
		backfaceCull: !!definition.backfaceCull,
		transparent: !!definition.transparent,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		opacity: definition.opacity ?? 1,
		emissiveStrength: definition.emissiveStrength ?? 1.8,
		texturePolicy: {
			publicFirebase: textureUrl.startsWith('https://awtsmoos-docs-base.web.app/'),
			fallbackApplied: !definition.textureUrl && !definition.mapImage,
			realMapImage: !!mapImage,
			...(definition.texturePolicy || {})
		}
	};
}

function fallbackTexture(definition) {
	const id = String(definition.id || '').toLowerCase();
	if (id.includes('water') || id.includes('lake') || id.includes('stream')) return TEXTURE_URLS.water.shallowRiver;
	if (id.includes('grass') || id.includes('bush') || id.includes('flower') || id.includes('reed')) return TEXTURE_URLS.terrain.grass7;
	if (id.includes('stone') || id.includes('well') || id.includes('cobble')) return TEXTURE_URLS.stone.cobblestone;
	if (id.includes('roof')) return TEXTURE_URLS.roof.tile2;
	if (id.includes('gold') || id.includes('coin') || id.includes('lamp')) return TEXTURE_URLS.metals.gold2;
	if (id.includes('sign') || id.includes('scroll') || id.includes('mezuza')) return TEXTURE_PURPOSES.mezuzaScroll;
	if (id.includes('dirt') || id.includes('soil') || id.includes('garden')) return TEXTURE_URLS.terrain.tilledSoil;
	return TEXTURE_URLS.wood.planks1;
}

function primitiveData(definition) {
	return PROCEDURAL.includes(definition.shape)
		? proceduralData({ ...definition, rgba: colorArray(definition.color) })
		: definition.shape === 'diamond'
			? diamondData(definition)
			: boxData(definition);
}

function boxData(definition) {
	const size = definition.size;
	const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
	const tile = Math.max(0.25, definition.texturePolicy?.tileWorld || 1);
	const mesh = { vertices: [], uvs: [], indices: [] };
	face(mesh, [[-half.x, -half.y, half.z], [half.x, -half.y, half.z], [half.x, half.y, half.z], [-half.x, half.y, half.z]], size.x / tile, size.y / tile);
	face(mesh, [[half.x, -half.y, -half.z], [-half.x, -half.y, -half.z], [-half.x, half.y, -half.z], [half.x, half.y, -half.z]], size.x / tile, size.y / tile);
	face(mesh, [[-half.x, -half.y, -half.z], [-half.x, -half.y, half.z], [-half.x, half.y, half.z], [-half.x, half.y, -half.z]], size.z / tile, size.y / tile);
	face(mesh, [[half.x, -half.y, half.z], [half.x, -half.y, -half.z], [half.x, half.y, -half.z], [half.x, half.y, half.z]], size.z / tile, size.y / tile);
	face(mesh, [[-half.x, half.y, half.z], [half.x, half.y, half.z], [half.x, half.y, -half.z], [-half.x, half.y, -half.z]], size.x / tile, size.z / tile);
	face(mesh, [[-half.x, -half.y, -half.z], [half.x, -half.y, -half.z], [half.x, -half.y, half.z], [-half.x, -half.y, half.z]], size.x / tile, size.z / tile);
	return { vertices: mesh.vertices.map((point) => localToWorld(v(...point), definition)), uvs: mesh.uvs, indices: mesh.indices };
}

function diamondData(definition) {
	const size = definition.size;
	const vertices = [v(0, size.y / 2, 0), v(size.x / 2, 0, 0), v(0, 0, size.z / 2), v(-size.x / 2, 0, 0), v(0, 0, -size.z / 2), v(0, -size.y / 2, 0)];
	return { vertices: vertices.map((point) => localToWorld(point, definition)), indices: [0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 1, 4, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1] };
}

function face(mesh, points, uSpan, vSpan) {
	const uv = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
	const indices = points.map((point, index) => {
		mesh.vertices.push(point);
		mesh.uvs.push(...uv[index]);
		return mesh.vertices.length - 1;
	});
	mesh.indices.push(indices[0], indices[1], indices[2], indices[0], indices[2], indices[3]);
}

function projectedUvs(vertices, definition) {
	const tile = Math.max(0.25, definition.texturePolicy?.tileWorld || 4);
	return vertices.flatMap((point) => {
		const ax = Math.abs(point.x);
		const ay = Math.abs(point.y);
		const az = Math.abs(point.z);
		if (ay >= ax && ay >= az) return [point.x / tile, point.z / tile];
		if (ax >= az) return [point.z / tile, point.y / tile];
		return [point.x / tile, point.y / tile];
	});
}

function localToWorld(point, definition) {
	const rotated = rotate(point, definition.rotation || { x: definition.pitch || 0, y: definition.yaw || 0, z: definition.roll || 0 });
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(rotated.x + center.x, rotated.y + center.y, rotated.z + center.z);
}

function rotate(point, rotation) {
	let { x, y, z } = point;
	const cx = Math.cos(rotation.x || 0);
	const sx = Math.sin(rotation.x || 0);
	const cy = Math.cos(rotation.y || 0);
	const sy = Math.sin(rotation.y || 0);
	const cz = Math.cos(rotation.z || 0);
	const sz = Math.sin(rotation.z || 0);
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	[x, z] = [x * cy - z * sy, x * sy + z * cy];
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	return v(x, y, z);
}

function flat(vertices) {
	return vertices.flatMap((point) => [point.x, point.y, point.z]);
}

function indexArray(indices) {
	return Math.max(0, ...indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

function colorArray(hex = '#777777') {
	const number = parseInt(String(hex).replace('#', ''), 16);
	return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255, 1];
}

function vertexNormals(data) {
	const normals = new Array(data.vertices.length).fill(0).map(() => v());
	for (let index = 0; index < data.indices.length; index += 3) {
		const a = data.indices[index];
		const b = data.indices[index + 1];
		const c = data.indices[index + 2];
		const normal = triangleNormal(data.vertices[a], data.vertices[b], data.vertices[c]);
		for (const vertexIndex of [a, b, c]) {
			normals[vertexIndex].x += normal.x;
			normals[vertexIndex].y += normal.y;
			normals[vertexIndex].z += normal.z;
		}
	}
	return normals.flatMap((normal) => {
		const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
		return [normal.x / length, normal.y / length, normal.z / length];
	});
}
