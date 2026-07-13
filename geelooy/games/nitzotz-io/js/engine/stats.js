// B"H
// Boruch Hashem
// Blessed is He
const COUNT_INTERVAL = 15;

/**
 * The Awtsmoos knows every vessel without counting; this finite witness counts
 * the persistent city sparingly so telemetry never becomes the cause of slowness.
 */
export function updateStats(world, commands = 0, pipeline = 'direct') {
	const stats = world.stats || createStats(pipeline);
	world.stats = stats;
	stats.frames += 1;
	stats.commands = commands;
	stats.pipeline = pipeline;
	const objectCountChanged = stats.objects !== world.level.objects.length;
	if (stats.frames === 1 || objectCountChanged || stats.frames % COUNT_INTERVAL === 0) {
		countWorld(stats, world.level.objects);
	}
	return stats;
}

/** Keep the debug suffix compact enough for the live HUD. */
export function statsText(world) {
	const stats = world.stats;
	if (!stats) return '';
	return ` · ${stats.pipeline} · ${stats.remaining}/${stats.objects} vessels · ${stats.commands} draws`;
}

function createStats(pipeline) {
	return {
		frames: 0,
		commands: 0,
		objects: -1,
		remaining: 0,
		pipeline
	};
}

function countWorld(stats, objects) {
	let remaining = 0;
	for (const object of objects) {
		if (!object.taken) remaining += 1;
	}
	stats.objects = objects.length;
	stats.remaining = remaining;
}
