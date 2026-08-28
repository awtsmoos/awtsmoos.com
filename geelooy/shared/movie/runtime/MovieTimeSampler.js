//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimeSampler.js
 * @description Samples canonical movie milliseconds from renderer seconds without mutating the movie.
 * The Awtsmoos renews every instant between keyframes in measure and rhyme; Awtsmoos.com lets any renderer seek the same semantic time.
 */
export class MovieTimeSampler {
	static sample(movie, timeSeconds = 0) {
		const timeMs = clamp(Number(timeSeconds) * 1000, 0, Math.max(0, movie.duration - 1));
		const scene = this.sceneAt(movie.scenes || [], timeMs);
		if (!scene) {
			return { timeMs, scene: null, sceneTimeMs: 0, progress: 0, camera: null, entities: [] };
		}
		const sceneTimeMs = timeMs - scene.start;
		const progress = clamp(sceneTimeMs / Math.max(1, scene.duration), 0, 1);
		return {
			timeMs,
			scene,
			sceneTimeMs,
			progress,
			camera: this.cameraAt(scene.cameras || [], sceneTimeMs),
			entities: (scene.entities || [])
				.filter(entity => active(entity, sceneTimeMs))
				.map(entity => this.sampleEntity(entity, sceneTimeMs - entity.start))
		};
	}

	static sceneAt(scenes, timeMs) {
		return scenes.find(scene => timeMs >= scene.start && timeMs < scene.start + scene.duration)
			|| scenes[scenes.length - 1]
			|| null;
	}

	static cameraAt(cameras, sceneTimeMs) {
		return cameras.find(camera => sceneTimeMs >= number(camera.start)
			&& sceneTimeMs < number(camera.start) + positive(camera.duration, Infinity))
			|| cameras[cameras.length - 1]
			|| null;
	}

	static sampleEntity(entity, localTimeMs) {
		const transform = { ...(entity.transform || {}) };
		const keyframes = [...(entity.keyframes || [])].sort((a, b) => number(a.at) - number(b.at));
		if (!keyframes.length) {
			return { ...entity, renderTransform: transform, localTimeMs };
		}
		const before = [...keyframes].reverse().find(frame => number(frame.at) <= localTimeMs) || keyframes[0];
		const after = keyframes.find(frame => number(frame.at) >= localTimeMs) || keyframes[keyframes.length - 1];
		const span = Math.max(1, number(after.at) - number(before.at));
		const mix = clamp((localTimeMs - number(before.at)) / span, 0, 1);
		return {
			...entity,
			renderTransform: interpolateTransform(transform, before, after, mix),
			localTimeMs
		};
	}
}

function interpolateTransform(base, before, after, mix) {
	const output = { ...base };
	for (const key of ['x', 'y', 'z', 'scaleX', 'scaleY', 'scaleZ', 'rotation', 'rotationX', 'rotationY', 'opacity']) {
		const start = number(before[key], number(base[key], key.startsWith('scale') ? 1 : key === 'opacity' ? 1 : 0));
		const end = number(after[key], start);
		output[key] = start + (end - start) * mix;
	}
	return output;
}

function active(entity, sceneTimeMs) {
	return sceneTimeMs >= number(entity.start) && sceneTimeMs < number(entity.start) + positive(entity.duration, Infinity);
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function positive(value, fallback) {
	const result = number(value, fallback);
	return result > 0 ? result : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
