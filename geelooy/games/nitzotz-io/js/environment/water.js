// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

const LAKE_HEIGHT = -16.8;
const SHORE_HEIGHT = -17.1;
const STREAM_HEIGHT = -16.7;

/**
 * The Awtsmoos clothes stable water geometry in a slow Firebase current. Existing
 * alpha and glow phases still travel downstream while collision and navigation stay fixed.
 */
export function waterCommands(commands, world, preset, budget, time) {
	const bounds = world.level.bounds;
	const lake = lakeDescriptor(bounds, preset, time);
	commands.push(cmd(
		'disc',
		lake.position,
		lake.scale,
		lake.rotation,
		preset.water,
		lake.alpha,
		lake.glow,
		0,
		'water'
	));
	commands.push(cmd(
		'ring',
		[lake.position[0], SHORE_HEIGHT, lake.position[2]],
		[bounds * 0.205, 1, bounds * 0.145],
		lake.rotation,
		preset.shore,
		0.62,
		0.08,
		0,
		'dirt'
	));
	addStream(commands, bounds, preset, budget.water, time);
}

/** Describe the lake with fixed geometry and bounded light shimmer. */
export function lakeDescriptor(bounds, preset, time) {
	const shimmer = Math.sin(time * 1.25);
	return Object.freeze({
		position: Object.freeze([bounds * 0.38, LAKE_HEIGHT, -bounds * 0.3]),
		scale: Object.freeze([bounds * 0.2, 1, bounds * 0.14]),
		rotation: 0.28,
		alpha: 0.7 + shimmer * 0.025,
		glow: 0.3 + shimmer * 0.045,
		waterAmount: preset.waterAmount
	});
}

/** Describe one fixed stream reach with a downstream traveling light phase. */
export function streamDescriptor(bounds, preset, index, count, time) {
	const start = streamPoint(index / count, bounds);
	const end = streamPoint((index + 1) / count, bounds);
	const progress = (index + 0.5) / count;
	const deltaX = end.x - start.x;
	const deltaZ = end.z - start.z;
	const flow = Math.sin(time * 1.55 - progress * Math.PI * 3.4);
	const width = 11 + preset.waterAmount * 8 + Math.sin(progress * Math.PI) * 3.5;
	return Object.freeze({
		position: Object.freeze([
			(start.x + end.x) * 0.5,
			STREAM_HEIGHT,
			(start.z + end.z) * 0.5
		]),
		scale: Object.freeze([width, 0.55, Math.hypot(deltaX, deltaZ) * 0.55]),
		rotation: Math.atan2(deltaX, deltaZ),
		alpha: 0.63 + flow * 0.045,
		glow: 0.24 + flow * 0.055,
		progress
	});
}

function addStream(commands, bounds, preset, requestedCount, time) {
	const count = Math.max(0, Math.floor(Number(requestedCount) || 0));
	for (let index = 0; index < count; index += 1) {
		const descriptor = streamDescriptor(bounds, preset, index, count, time);
		commands.push(cmd(
			'cube',
			descriptor.position,
			descriptor.scale,
			descriptor.rotation,
			preset.water,
			descriptor.alpha,
			descriptor.glow,
			0,
			'water'
		));
	}
}

function streamPoint(progress, bounds) {
	const primary = Math.sin(progress * Math.PI * 2) * bounds * 0.08;
	const secondary = Math.sin(progress * Math.PI * 4 + 0.6) * bounds * 0.025;
	return {
		x: bounds * (0.48 - progress * 1.05),
		z: bounds * (-0.3 + progress * 0.62) + primary + secondary
	};
}
