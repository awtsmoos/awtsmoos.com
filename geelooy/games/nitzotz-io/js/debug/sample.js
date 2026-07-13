// B"H
// Boruch Hashem
// Blessed is He
import { directorSummary } from '../director/director.js';

/** The Awtsmoos gathers one bounded evidence snapshot from the living arena. */
export function sampleWorld(world, renderer) {
	const counts = countObjects(world.level.objects);
	const performance = world.performance;
	return {
		mode: world.mode,
		gameMode: { id: world.gameMode.id, name: world.gameMode.name },
		level: { index: world.level.index, key: world.level.key, name: world.level.name, chapter: world.level.chapterName },
		campaign: {
			unlocked: world.save.unlocked,
			selectedChapter: world.save.selectedChapter,
			sparks: world.save.sparks,
			upgradeTiers: { ...world.save.upgradeTiers },
			quests: { ...world.save.questProgress }
		},
		mass: world.player.mass,
		rank: world.rank,
		time: world.timeLeft,
		objects: world.level.objects.length,
		...counts,
		botanicalGallery: Boolean(world.botanicalGallery),
		powerups: { ...world.powerups },
		rivals: world.rivals.map(rival => ({ name: rival.name, archetype: rival.archetype.name, mass: rival.mass })),
		director: directorSummary(world),
		achievements: Object.keys(world.save.achievements).length,
		performance: {
			fps: performance.fps,
			ms: performance.ms,
			p95: performance.p95,
			p99: performance.p99,
			scale: performance.scale,
			resolutionScale: performance.resolutionScale,
			stress: performance.stress,
			commands: performance.commands,
			postfx: performance.postfx
		},
		stats: world.stats ? { ...world.stats } : null,
		webglError: renderer.gl.getError(),
		message: world.message
	};
}

function countObjects(objects) {
	const counts = { remaining: 0, traffic: 0, pedestrians: 0, compositeModels: 0, botanical: 0 };
	for (const object of objects) {
		if (object.taken) continue;
		counts.remaining += 1;
		counts.traffic += Number(Boolean(object.traffic));
		counts.pedestrians += Number(Boolean(object.pedestrian));
		counts.compositeModels += Number(object.shape.startsWith('model:'));
		counts.botanical += Number(object.category === 'botanical');
	}
	return counts;
}
