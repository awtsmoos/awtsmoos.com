// B"H
/** Adds three batched stream cascades and fieldstone ledges without per-frame CPU geometry. */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { normalBetween, streamCenterAt, streamWidthAt } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const CASCADES = Object.freeze([0.22, 0.54, 0.82]);

export function createWaterfallDefinitions(groundSampler) {
	const sheets = { vertices: [], faces: [], uvs: [] };
	const rapids = { vertices: [], faces: [], uvs: [] };
	const ledges = [];
	for (const [index, t] of CASCADES.entries()) appendCascade(sheets, rapids, ledges, groundSampler, t, index);
	return [
		waterDefinition('stream-waterfall-sheets', sheets, [3, 2], '#d6f5ff'),
		waterDefinition('stream-whitewater-rapids', rapids, [5, 1], '#eefcff'),
		createVillageBoxBatch('stream-cascade-fieldstone-ledges', ledges, {
			color: '#756f65',
			family: 'stream-cascade',
			part: 'fieldstone-ledge',
			textureUrl: TEXTURE_URLS.bricks.fieldstone1
		})
	];
}

function appendCascade(sheets, rapids, ledges, groundSampler, t, index) {
	const center = streamCenterAt(t);
	const before = streamCenterAt(Math.max(0, t - 0.01));
	const after = streamCenterAt(Math.min(1, t + 0.01));
	const normal = normalBetween(before, after);
	const width = streamWidthAt(t) * 0.82;
	const ground = villageGroundHeight(groundSampler, center.x, center.z);
	const top = ground + 1.18 + index * 0.12;
	const bottom = ground + 0.14;
	const left = [center.x - normal.x * width, center.z - normal.z * width];
	const right = [center.x + normal.x * width, center.z + normal.z * width];
	appendQuad(sheets, [
		[left[0], top, left[1]], [right[0], top, right[1]],
		[right[0], bottom, right[1]], [left[0], bottom, left[1]]
	]);
	const direction = directionBetween(before, after);
	appendQuad(rapids, [
		[left[0], bottom + 0.04, left[1]], [right[0], bottom + 0.04, right[1]],
		[right[0] + direction.x * 3.6, bottom + 0.02, right[1] + direction.z * 3.6],
		[left[0] + direction.x * 3.6, bottom + 0.02, left[1] + direction.z * 3.6]
	]);
	ledges.push({
		position: { x: center.x, y: ground + 0.34, z: center.z },
		size: { x: width * 2.55, y: 0.68, z: 0.72 },
		yaw: Math.atan2(direction.x, direction.z)
	});
}

function appendQuad(geometry, points) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...points);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
	geometry.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}

function waterDefinition(id, geometry, mapRepeat, color) {
	return {
		id: `Awtsmoos_${id}`,
		shape: 'manual',
		...geometry,
		alphaMode: 'BLEND',
		color,
		doubleSided: true,
		mapRepeat,
		opacity: 0.82,
		solid: false,
		transparent: true,
		texturePolicy: {
			animated: true,
			publicFirebase: true,
			shader: 'layered-flow-refraction-fresnel-foam'
		},
		textureUrl: TEXTURE_URLS.water.bright,
		userData: { family: 'stream-cascade', instances: CASCADES.length }
	};
}

function directionBetween(first, second) {
	const x = second.x - first.x;
	const z = second.z - first.z;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}
