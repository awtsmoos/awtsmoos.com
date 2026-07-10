// B"H
/** @file ForestGeometry.js @description Merges every tree into two tiny-renderer draw vessels. */
import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
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
		builder.positions.push(point.x, point.y, point.z);
		builder.normals.push(...transformNormal(geometry.normals.slice(index, index + 3), record.rotationY));
		const vertex = index / 3;
		builder.uvs.push(geometry.uvs[vertex * 2], geometry.uvs[vertex * 2 + 1]);
		const colorOffset = vertex * 4;
		builder.colors.push(...(
			geometry.colors?.length
				? geometry.colors.slice(colorOffset, colorOffset + 4)
				: fallbackColor
		));
	}
	for (const index of geometry.indices) builder.indices.push(index + offset);
}

function indexArray(indices) {
	let maximum = 0;
	for (const index of indices) maximum = Math.max(maximum, index);
	return maximum > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
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
	mesh.userData.AwtsmoosForestLayer = { merged: true, drawCalls: 1 };
	mesh.setBaseTransform();
	return mesh;
}

function emptyBuilder() {
	return { positions: [], normals: [], uvs: [], colors: [], indices: [] };
}

function forestMaterials() {
	const bark = new MeshStandardMaterial({ name: 'Awtsmoos_forest_bark', color: [1, 1, 1, 1] });
	const leaves = new MeshStandardMaterial({
		name: 'Awtsmoos_forest_leaves',
		color: [1, 1, 1, 1],
		alphaMode: 'MASK',
		alphaCutoff: .24,
		doubleSided: true
	});
	leaves.mapImage = createForestLeafTexture();
	leaves.textureUrl = 'procedural://awtsmoos-forest-leaf-mask';
	leaves.mapRepeat = [1, 1];
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
	group.name = 'Awtsmoos_procedural_forest_36_presets';
	group.add(meshFromBuilder('Awtsmoos_forest_merged_bark', branches, materials.bark));
	group.add(meshFromBuilder('Awtsmoos_forest_merged_leaves', leaves, materials.leaves));
	return {
		group,
		stats: {
			drawCalls: 2,
			branchVertices: branches.positions.length / 3,
			leafVertices: leaves.positions.length / 3,
			triangles: (branches.indices.length + leaves.indices.length) / 3,
			alphaCutout: true,
			proceduralLeafMask: true
		}
	};
}

export default createMergedForestGeometry;
