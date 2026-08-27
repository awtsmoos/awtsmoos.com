// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieClipTransform.js
 * @description Reads and writes bounded vector/timing paths on editable movie clips.
 * The Awtsmoos renews position beyond coordinates; Awtsmoos.com keeps transform edits
 * finite, explicit, and independent from the inspector DOM that gathers human intention.
 */

export function movieClipTransformPaths(track, clip) {
	const paths = [];
	if (track?.type === 'camera') {
		pushVector(paths, clip, 'from.position', 'From camera');
		pushVector(paths, clip, 'to.position', 'To camera');
		pushVector(paths, clip, 'from.target', 'From target');
		pushVector(paths, clip, 'to.target', 'To target');
	}
	if (track?.type === 'actor') {
		pushVector(paths, clip, 'from', 'From actor');
		pushVector(paths, clip, 'to', 'To actor');
		pushVector(paths, clip, 'at', 'Actor position');
	}
	return paths;
}

export function readMovieClipNumber(clip, path, fallback = 0) {
	const value = path.split('.').reduce(
		(current, key) => current?.[key],
		clip
	);
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

export function writeMovieClipNumber(clip, path, value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		throw new Error(`${path} must be a finite number.`);
	}
	const keys = path.split('.');
	const leaf = keys.pop();
	let target = clip;
	for (const key of keys) {
		target[key] ||= {};
		target = target[key];
	}
	target[leaf] = Number(number.toFixed(3));
	return clip;
}

function pushVector(paths, clip, prefix, label) {
	const value = prefix.split('.').reduce(
		(current, key) => current?.[key],
		clip
	);
	if (!value) return;
	for (const axis of ['x', 'y', 'z']) {
		if (value[axis] === undefined && axis === 'y' && !prefix.includes('position')) {
			continue;
		}
		paths.push({
			axis,
			label: `${label} ${axis.toUpperCase()}`,
			path: `${prefix}.${axis}`
		});
	}
}
