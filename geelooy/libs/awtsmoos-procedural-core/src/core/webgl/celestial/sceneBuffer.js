//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Celestial-scene to native-GPU point-buffer translation.
 * @description
 * The Awtsmoos, Atzmus beyond number, recreates each star and measured coordinate before arrays can contain their light;
 * Awtsmoos.com lets Hod translate renderer-neutral astronomy into a small GPU covenant where daylight, horizon, magnitude, and mobile density remain right.
 * This file owns data packing only. It does not create GPU resources or calculate astronomical positions.
 */

const FLOATS_PER_POINT = 7;
const KIND_STAR = 0;
const KIND_SUN = 1;
const KIND_MOON = 2;
const KIND_FLARE = 3;

/**
 * Packs one celestial scene into the compact point format consumed by WebGL2.
 *
 * @param {object} scene
 * 	Renderer-neutral celestial snapshot containing sun, moon, stars, and flare.
 * @param {{width:number,height:number,pixelRatio:number}} viewport
 * 	Current backing-store geometry used to derive physical point sizes.
 * @returns {{data:Float32Array,count:number}}
 * 	Interleaved GPU point attributes and point count.
 */
export function buildCelestialPointBuffer(scene, viewport) {
	if (!scene?.sun || !scene?.moon) {
		return { data: new Float32Array(), count: 0 };
	}

	const points = [];
	appendStars(points, scene, viewport);
	appendSun(points, scene, viewport);
	appendMoon(points, scene, viewport);
	appendFlare(points, scene, viewport);

	return {
		data: new Float32Array(points),
		count: points.length / FLOATS_PER_POINT
	};
}

/** Packs real catalog stars with daylight, horizon, magnitude, and DPR scaling. */
function appendStars(points, scene, viewport) {
	const darkness = clamp((-scene.sun.altitudeDegrees + 2) / 12, 0, 1);
	const pixelRatio = clamp(viewport.pixelRatio, 0.75, 1.5);
	for (const star of scene.stars || []) {
		const horizon = clamp((star.altitudeDegrees + 3) / 14, 0, 1);
		const magnitude = clamp(1.15 - (star.magnitude + 1.5) / 4.2, 0.22, 1);
		const alpha = darkness * horizon * magnitude;
		if (alpha > 0.015) {
			const size = (2.1 + magnitude * 2.4) * pixelRatio;
			pushPoint(points, star.x, star.y, size, KIND_STAR, alpha, 0, 0);
		}
	}
}

/** Packs the sun only while its refracted disc can plausibly touch the visible horizon. */
function appendSun(points, scene, viewport) {
	if (scene.sun.altitudeDegrees < -1.5) {
		return;
	}
	pushPoint(points, scene.sun.x, scene.sun.y, 44 * viewport.pixelRatio, KIND_SUN, 1, 1, 1);
}

/** Packs the moon only while the geometric disc is above the visual horizon. */
function appendMoon(points, scene, viewport) {
	if (scene.moon.altitudeDegrees < -0.7) {
		return;
	}
	pushPoint(
		points,
		scene.moon.x,
		scene.moon.y,
		32 * viewport.pixelRatio,
		KIND_MOON,
		0.96,
		clamp(scene.moon.phase?.illuminatedFraction, 0, 1),
		scene.moon.phase?.waxing ? 1 : 0
	);
}

/** Packs bounded optical ghosts only when the renderer-neutral flare plan is visible. */
function appendFlare(points, scene, viewport) {
	if (!scene.lensFlare?.visible) {
		return;
	}
	const baseSize = Math.min(viewport.width, viewport.height);
	for (const ghost of scene.lensFlare.ghosts || []) {
		const size = clamp(ghost.size * baseSize, 5, 52 * viewport.pixelRatio);
		pushPoint(points, ghost.x, ghost.y, size, KIND_FLARE, ghost.alpha, 0, 0);
	}
}

/** Appends one normalized celestial point in clip-space GPU layout. */
function pushPoint(points, x, y, size, kind, alpha, phase, waxing) {
	const clipX = clamp(x, 0, 1) * 2 - 1;
	const clipY = 1 - clamp(y, 0, 1) * 2;
	points.push(clipX, clipY, size, kind, clamp(alpha, 0, 1), phase, waxing);
}

/** Restricts numeric scene data before it reaches the GPU boundary. */
function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: minimum;
}
