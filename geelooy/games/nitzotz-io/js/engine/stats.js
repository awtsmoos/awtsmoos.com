// B"H

/** Record frame evidence without assuming a chunk streamer still exists. */
export function updateStats(world, commands = 0, pipeline = 'direct') {
	const stats = world.stats || (world.stats = {
		frames: 0,
		commands: 0,
		objects: 0,
		remaining: 0,
		pipeline
	});
	stats.frames += 1;
	stats.commands = commands;
	stats.objects = world.level.objects.length;
	stats.remaining = world.level.objects.filter(object => !object.taken).length;
	stats.pipeline = pipeline;
	return stats;
}

/** Keep the debug suffix compact enough for the live HUD. */
export function statsText(world) {
	const stats = world.stats;
	if (!stats) return '';
	return ` · ${stats.pipeline} · ${stats.remaining}/${stats.objects} vessels · ${stats.commands} draws`;
}
