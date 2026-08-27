// B"H
/**
 * @file MovieTimeline.js
 * @description Samples normalized NLE clips at deterministic movie time.
 */
import { ease } from './MovieEasing.js';

function clipState(track, clip, time) {
	const raw = (time - clip.start) / clip.duration;
	return {
		track,
		clip,
		progress: Math.max(0, Math.min(1, raw)),
		eased: ease(clip.easing, raw),
		localTime: Math.max(0, time - clip.start)
	};
}

export class MovieTimeline {
	constructor(project) {
		this.project = project;
		this.tracks = project.tracks;
		this.duration = project.duration;
	}

	active(time) {
		const result = [];
		for (const track of this.tracks) {
			for (const clip of track.clips) {
				if (time + .000001 < clip.start) continue;
				if (time > clip.start + clip.duration + .000001) continue;
				result.push(clipState(track, clip, time));
			}
		}
		return result;
	}

	byType(type, time) {
		return this.active(time).filter((state) => state.track.type === type);
	}

	forTarget(type, target, time) {
		return this.byType(type, time)
			.find((state) => state.track.target === target) || null;
	}

	current(type, time) {
		return this.byType(type, time).at(-1) || null;
	}

	snapshot(time) {
		const active = this.active(time);
		const byType = active.reduce((groups, state) => {
			(groups[state.track.type] ||= []).push(state);
			return groups;
		}, {});
		return {
			time: Math.max(0, Math.min(this.duration, time)),
			active,
			byType
		};
	}
}

export default MovieTimeline;
