// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceDirector.js
 * @description Replays multi-character transforms, animations, actions, interactions, and cameras.
 * The Awtsmoos creates all performers together without merging their identities; Awtsmoos.com
 * restores authored state, orders simultaneous deeds, and reveals deterministic acting in cinematic rhyme.
 */

import { resolveMoviePerformanceClips } from './MoviePerformanceClipResolver.js';
import { applyMoviePerformanceRecordedCamera } from './MoviePerformancePlaybackCamera.js';
import { applyMoviePerformanceEntry } from './MoviePerformancePlaybackApply.js';
import { dispatchMoviePerformanceEvents } from './MoviePerformancePlaybackDispatch.js';
import { MoviePerformancePlaybackState } from './MoviePerformancePlaybackState.js';
import { resolveMoviePerformanceEvents } from './MoviePerformanceEventResolver.js';
import { discoverMoviePerformanceTargets } from './MoviePerformanceRoster.js';
import {
	applyMoviePerformanceCamera,
	moviePerformanceCameraSnapshot
} from './MoviePerformanceCameraValue.js';

export class MoviePerformanceDirector {
	constructor(runtime, project, options = {}) {
		this.runtime = runtime;
		this.project = project;
		this.resolveObject = options.resolveObject || resolveRuntimeObject(runtime);
		this.state = new MoviePerformancePlaybackState();
		this.previousTime = 0;
		this.cameraBaseline = null;
		this.refreshTargets();
	}

	beginFrame() {
		this.state.restoreAll(this.targets);
		if (this.cameraBaseline) {
			applyMoviePerformanceCamera(this.runtime.camera, this.cameraBaseline);
			this.cameraBaseline = null;
		}
	}

	refreshTargets() {
		const targets = discoverMoviePerformanceTargets(this.runtime, this.project);
		this.targets = new Map(targets.map(target => [target.id, target]));
		return this.targets;
	}

	apply(time) {
		const entries = resolveMoviePerformanceClips(this.project, time);
		const actors = [];
		for (const entry of strongestEntries(entries).values()) {
			const target = this.targets.get(entry.track.target);
			if (!target?.model) {
				actors.push(missingTarget(entry));
				continue;
			}
			const baseline = this.state.capture(target);
			actors.push(applyMoviePerformanceEntry(entry, target, baseline));
		}
		const events = resolveMoviePerformanceEvents(
			this.project,
			this.previousTime,
			time
		).map(event => attachTrackTarget(event, this.project));
		const dispatched = dispatchMoviePerformanceEvents(
			events,
			this.targets,
			this.resolveObject
		);
		this.cameraBaseline = entries.some(entry => entry.take.cameraSamples?.length)
			? moviePerformanceCameraSnapshot(this.runtime.camera, time)
			: null;
		const camera = applyMoviePerformanceRecordedCamera(entries, this.runtime.camera);
		this.previousTime = time;
		return { actors, camera, dispatched, entries, time };
	}

	setProject(project) {
		this.beginFrame();
		this.project = project;
		this.previousTime = 0;
		this.refreshTargets();
	}

	destroy() {
		this.beginFrame();
		this.state.clear();
		this.targets.clear();
	}
}

function strongestEntries(entries) {
	const map = new Map();
	for (const entry of entries) {
		map.set(entry.track.target, entry);
	}
	return map;
}

function missingTarget(entry) {
	return {
		applied: false,
		warning: `PERFORMANCE_TARGET_MISSING:${entry.track.target}`
	};
}

function attachTrackTarget(event, project) {
	const track = project.tracks.find(item => item.id === event.trackId);
	return { ...event, trackTarget: track?.target || null };
}

function resolveRuntimeObject(runtime) {
	return id => runtime.scene?.getObjectByProperty?.('userData.id', id)
		|| runtime.scene?.getObjectByName?.(id)
		|| null;
}
