// B"H
// Boruch Hashem
// Blessed is He
/** A CPU mirror proves the eight atomic offerings the WGSL river makes to its grid. */

import { createWebGpuGridLayout3d } from "./createWebGpuGridLayout3d.js";

const INT32_MINIMUM = -2147483648;
const INT32_MAXIMUM = 2147483647;

function addInt32(values, index, contribution) {
	if (!Number.isFinite(contribution)
		|| contribution < INT32_MINIMUM
		|| contribution > INT32_MAXIMUM) {
		throw new RangeError("Fixed-point grid contribution exceeds signed 32-bit range.");
	}
	const next = values[index] + contribution;
	if (next < INT32_MINIMUM || next > INT32_MAXIMUM) {
		throw new RangeError("Fixed-point grid accumulation exceeds signed 32-bit range.");
	}
	values[index] = next;
}

function particleArray(value) {
	const particles = Array.isArray(value) ? value : value?.particles;
	if (!Array.isArray(particles)) {
		throw new TypeError("Fixed-point deposition requires particles or a particle system.");
	}
	return particles;
}

function cellIndex(layout, x, y, z) {
	return x + layout.dimensions[0] * (y + layout.dimensions[1] * z);
}

function depositNeighbor(values, layout, particle, coordinate, weight, scale) {
	if (coordinate.some((value, axis) => (
		value < 0 || value >= layout.dimensions[axis]
	))) return;
	const mass = Number(particle.mass ?? 1);
	if (!Number.isFinite(mass) || mass < 0) {
		throw new TypeError("Particle mass must be finite and nonnegative.");
	}
	const offset = cellIndex(layout, ...coordinate) * 4;
	const scaledMass = Math.round(mass * weight * scale);
	addInt32(values, offset, scaledMass);
	for (let axis = 0; axis < 3; axis += 1) {
		const velocity = Number(particle.velocity?.[axis] ?? 0);
		if (!Number.isFinite(velocity)) {
			throw new TypeError("Particle velocity components must be finite.");
		}
		addInt32(
			values,
			offset + axis + 1,
			Math.round(mass * velocity * weight * scale)
		);
	}
}

export function depositParticlesToFixedPointGrid3d(particlesInput, input = {}) {
	const layout = createWebGpuGridLayout3d(input.gridLayout ?? input);
	const scale = Number(input.fixedPointScale ?? 1024);
	if (!Number.isFinite(scale) || scale <= 0) {
		throw new TypeError("Fixed-point scale must be positive and finite.");
	}
	const values = new Int32Array(layout.cellCount * 4);
	for (const particle of particleArray(particlesInput)) {
		const position = particle.position?.map(Number);
		if (!position || position.length !== 3 || position.some(value => !Number.isFinite(value))) {
			throw new TypeError("Particle positions must contain three finite values.");
		}
		const gridPosition = position.map((value, axis) => (
			(value - layout.origin[axis]) / layout.cellSize
		));
		const base = gridPosition.map(Math.floor);
		const fraction = gridPosition.map((value, axis) => value - base[axis]);
		for (let z = 0; z < 2; z += 1) {
			for (let y = 0; y < 2; y += 1) {
				for (let x = 0; x < 2; x += 1) {
					const weight = [x, y, z].reduce((product, side, axis) => (
						product * (side === 0 ? 1 - fraction[axis] : fraction[axis])
					), 1);
					depositNeighbor(values, layout, particle, [
						base[0] + x,
						base[1] + y,
						base[2] + z
					], weight, scale);
				}
			}
		}
	}
	return Object.freeze({
		schema: "awtsmoos.fixed-point-particle-grid-3d",
		layout,
		fixedPointScale: scale,
		values
	});
}
