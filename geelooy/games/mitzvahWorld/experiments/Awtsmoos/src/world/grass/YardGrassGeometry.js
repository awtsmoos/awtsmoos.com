// B"H
import { localToWorld } from '../house/HouseSpec.js';

const TAU = Math.PI * 2;

/** Adapts procedural-core blade ideas into one phone-friendly merged yard mesh. */
export function createYardGrassDefinition(spec, patches, groundSampler) {
	const mesh = { vertices: [], faces: [], uvs: [] };
	const tuftCount = Math.max(90, Math.round((spec.width + spec.depth) * 1.4));
	for (let index = 0; index < tuftCount; index += 1) {
		const patch = patches[index % patches.length];
		const localX = mix(patch.minX, patch.maxX, random(index, 17));
		const localZ = mix(patch.minZ, patch.maxZ, random(index, 31));
		const world = localToWorld(spec, localX, localZ);
		const groundY = groundSampler.heightAt(world.x, world.z).y + 0.018;
		const height = 0.38 + random(index, 53) * 0.42;
		const width = 0.045 + random(index, 71) * 0.035;
		for (let blade = 0; blade < 3; blade += 1) {
			appendBlade(
				mesh,
				world.x,
				groundY,
				world.z,
				height * (0.82 + random(index + blade, 89) * 0.32),
				width,
				random(index, blade + 101) * TAU + blade * TAU / 3
			);
		}
	}
	return {
		id: `${spec.id}-dynamic-yard-grass`,
		shape: 'manual',
		solid: false,
		walkable: false,
		noEdge: true,
		color: '#6abf43',
		doubleSided: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		grassReactive: true,
		grassInteractionRadius: 2.2,
		grassWindStrength: 0.085,
		userData: {
			AwtsmoosYardGrass: {
				houseId: spec.id,
				patches,
				tuftCount,
				bladeCount: tuftCount * 3,
				source: 'awtsmoos-procedural-core-curved-multi-blade-adaptation',
				reactsToPlayer: true,
				insideFenceOnly: true
			}
		}
	};
}

function appendBlade(mesh, x, y, z, height, width, yaw) {
	const cosine = Math.cos(yaw);
	const sine = Math.sin(yaw);
	const horizontal = { x: cosine * width, z: sine * width };
	const bend = 0.08 * Math.sin(yaw * 1.7);
	const points = [
		[x - horizontal.x, y, z - horizontal.z],
		[x + horizontal.x, y, z + horizontal.z],
		[x + horizontal.x * 0.28 + bend, y + height, z + horizontal.z * 0.28],
		[x - horizontal.x * 0.28 + bend, y + height, z - horizontal.z * 0.28]
	];
	const start = mesh.vertices.length;
	mesh.vertices.push(...points);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}

function random(index, seed) {
	const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
	return value - Math.floor(value);
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}
