// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectDelta.js
 * @description Summarizes duration, tracks, clips, markers, worlds, assets, and identity changes between projects.
 * The Awtsmoos is beyond before and after while every finite edit must honestly reveal what moved;
 * Awtsmoos.com gives agents and humans one JSON receipt of additions, removals, duration, and structure improved.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieProjectDelta(before, after) {
	const beforeIndex = indexProject(before);
	const afterIndex = indexProject(after);
	return createMovieProjectSnapshot({
		clips: identityDelta(beforeIndex.clips, afterIndex.clips),
		duration: {
			after: Number(after?.duration || 0),
			before: Number(before?.duration || 0),
			delta: Number((Number(after?.duration || 0) - Number(before?.duration || 0)).toFixed(4))
		},
		markers: identityDelta(beforeIndex.markers, afterIndex.markers),
		summary: {
			added: afterIndex.all.size - intersectionSize(beforeIndex.all, afterIndex.all),
			changed: changedCount(beforeIndex.values, afterIndex.values),
			removed: beforeIndex.all.size - intersectionSize(beforeIndex.all, afterIndex.all)
		},
		tracks: identityDelta(beforeIndex.tracks, afterIndex.tracks),
		worlds: identityDelta(beforeIndex.worlds, afterIndex.worlds)
	});
}

function indexProject(project = {}) {
	const tracks = new Set();
	const clips = new Set();
	const markers = new Set();
	const worlds = new Set();
	const values = new Map();
	for (const track of project.tracks || []) {
		const trackKey = `track:${track.id}`;
		tracks.add(trackKey);
		values.set(trackKey, stable(track));
		for (const clip of track.clips || []) {
			const clipKey = `clip:${track.id}:${clip.id}`;
			clips.add(clipKey);
			values.set(clipKey, stable(clip));
			if (clip.world) worlds.add(`world:${worldIdentity(clip.world)}`);
		}
	}
	for (const marker of project.markers || []) {
		const key = `marker:${marker.id}`;
		markers.add(key);
		values.set(key, stable(marker));
	}
	return {
		all: new Set([...tracks, ...clips, ...markers, ...worlds]),
		clips,
		markers,
		tracks,
		values,
		worlds
	};
}

function identityDelta(before, after) {
	return {
		added: [...after].filter(value => !before.has(value)).sort(),
		kept: [...after].filter(value => before.has(value)).sort(),
		removed: [...before].filter(value => !after.has(value)).sort()
	};
}

function changedCount(before, after) {
	let count = 0;
	for (const [key, value] of after) {
		if (before.has(key) && before.get(key) !== value) count += 1;
	}
	return count;
}

function intersectionSize(left, right) {
	let count = 0;
	for (const value of left) if (right.has(value)) count += 1;
	return count;
}

function worldIdentity(value) {
	return typeof value === 'string' ? value : value.id || value.regionId || JSON.stringify(value);
}

function stable(value) {
	return JSON.stringify(value, Object.keys(value || {}).sort());
}
