// B"H
import { localToWorld } from '../house/HouseSpec.js';

const TAU = Math.PI * 2;

/**
 * Reveals a denser living yard from one merged manual mesh.
 * Each tuft is a small chorus: crossed blades, curved tips, seed wisps, and rare flowers.
 */
export function createYardGrassDefinition(spec, patches, groundSampler) {
	const mesh = { vertices: [], faces: [], uvs: [] };
	const tuftCount = Math.max(150, Math.round((spec.width + spec.depth) * 2.25));
	let flowerCount = 0;
	let bladeCount = 0;
	for (let index = 0; index < tuftCount; index += 1) {
		const patch = patches[index % patches.length];
		const localX = mix(patch.minX, patch.maxX, random(index, 17));
		const localZ = mix(patch.minZ, patch.maxZ, random(index, 31));
		const world = localToWorld(spec, localX, localZ);
		const groundY = groundSampler.heightAt(world.x, world.z).y + 0.018;
		const tuft = createTuft(index, world.x, groundY, world.z);
		for (const blade of tuft.blades) {
			appendBlade(mesh, blade);
			bladeCount += 1;
		}
		if (tuft.flower) {
			appendFlower(mesh, tuft.flower);
			flowerCount += 1;
		}
	}
	return {
		id: `${spec.id}-dynamic-yard-grass`,
		shape: 'manual',
		solid: false,
		walkable: false,
		noEdge: true,
		color: '#68ba3f',
		doubleSided: true,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		grassReactive: true,
		grassInteractionRadius: 2.65,
		grassWindStrength: 0.12,
		userData: {
			AwtsmoosYardGrass: {
				houseId: spec.id,
				patches,
				tuftCount,
				bladeCount,
				flowerCount,
				seed: `${spec.id}-613-yard-life`,
				source: 'merged-curved-cross-blade-flower-head-generator',
				reactsToPlayer: true,
				insideFenceOnly: true,
				performance: 'one-manual-mesh-per-yard-no-collider'
			}
		}
	};
}

function createTuft(index, x, y, z) {
	const blades = [];
	const count = 4 + Math.floor(random(index, 131) * 3);
	const baseHeight = 0.32 + random(index, 53) * 0.62;
	const baseWidth = 0.028 + random(index, 71) * 0.032;
	const yaw = random(index, 101) * TAU;
	for (let blade = 0; blade < count; blade += 1) {
		const turn = yaw + blade * TAU / count + random(index + blade, 197) * 0.38;
		const lean = 0.035 + random(index + blade, 211) * 0.11;
		blades.push({
			x,
			y,
			z,
			height: baseHeight * (0.72 + random(index + blade, 89) * 0.42),
			width: baseWidth * (0.75 + random(index + blade, 97) * 0.55),
			yaw: turn,
			lean
		});
	}
	return {
		blades,
		flower: random(index, 307) > 0.82
			? {
				x,
				y: y + baseHeight * 0.92,
				z,
				radius: 0.035 + random(index, 313) * 0.025,
				yaw
			}
			: null
	};
}

function appendBlade(mesh, blade) {
	const cosine = Math.cos(blade.yaw);
	const sine = Math.sin(blade.yaw);
	const side = { x: cosine * blade.width, z: sine * blade.width };
	const forward = { x: -sine * blade.lean, z: cosine * blade.lean };
	const waistY = blade.y + blade.height * 0.52;
	const tipY = blade.y + blade.height;
	const rootLeft = [blade.x - side.x, blade.y, blade.z - side.z];
	const rootRight = [blade.x + side.x, blade.y, blade.z + side.z];
	const waistRight = [blade.x + side.x * 0.58 + forward.x * 0.45, waistY, blade.z + side.z * 0.58 + forward.z * 0.45];
	const waistLeft = [blade.x - side.x * 0.58 + forward.x * 0.35, waistY, blade.z - side.z * 0.58 + forward.z * 0.35];
	const tip = [blade.x + forward.x, tipY, blade.z + forward.z];
	const start = mesh.vertices.length;
	mesh.vertices.push(rootLeft, rootRight, waistRight, waistLeft, tip);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.faces.push([start + 3, start + 2, start + 4]);
	mesh.uvs.push(0, 0, 1, 0, 0.82, 0.62, 0.18, 0.62, 0.5, 1);
}

function appendFlower(mesh, flower) {
	const start = mesh.vertices.length;
	mesh.vertices.push(
		[flower.x, flower.y + flower.radius, flower.z],
		[flower.x + Math.cos(flower.yaw) * flower.radius, flower.y, flower.z + Math.sin(flower.yaw) * flower.radius],
		[flower.x - Math.sin(flower.yaw) * flower.radius, flower.y, flower.z + Math.cos(flower.yaw) * flower.radius],
		[flower.x - Math.cos(flower.yaw) * flower.radius, flower.y, flower.z - Math.sin(flower.yaw) * flower.radius],
		[flower.x + Math.sin(flower.yaw) * flower.radius, flower.y, flower.z - Math.cos(flower.yaw) * flower.radius]
	);
	mesh.faces.push([start, start + 1, start + 2]);
	mesh.faces.push([start, start + 2, start + 3]);
	mesh.faces.push([start, start + 3, start + 4]);
	mesh.faces.push([start, start + 4, start + 1]);
	mesh.uvs.push(0.5, 1, 1, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5);
}

function random(index, seed) {
	const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
	return value - Math.floor(value);
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}
