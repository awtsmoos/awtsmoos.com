//B"H
/** The Awtsmoos marks the places a song returns to — verses, choruses, turning points. */
import { createMultitrackId } from './multitrackIds.js';

const nonneg = (v, f = 0) => Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : f;

/** A named point on the timeline; also a magnetic snapping target. */
export function createMultitrackMarker(input = {}) {
	return {
		id: input.id || createMultitrackId('marker'),
		name: String(input.name || 'Marker'),
		time: nonneg(input.time)
	};
}

/** A named arrangement section spanning a time range. */
export function createMultitrackSection(input = {}) {
	const start = nonneg(input.start);
	const end = Math.max(start + .1, nonneg(input.end, start + 4));
	return {
		id: input.id || createMultitrackId('section'),
		name: String(input.name || 'Section'),
		start, end,
		color: String(input.color || 'gold')
	};
}

export const normalizeMarkers = input => (Array.isArray(input) ? input.map(createMultitrackMarker) : [])
	.sort((a, b) => a.time - b.time);
export const normalizeSections = input => (Array.isArray(input) ? input.map(createMultitrackSection) : [])
	.sort((a, b) => a.start - b.start);

export function addMarker(project, markerInput) {
	const marker = createMultitrackMarker(markerInput);
	return { project: { ...project, markers: normalizeMarkers([...(project.markers || []), marker]) }, marker };
}

export function removeMarker(project, markerId) {
	return { ...project, markers: (project.markers || []).filter(m => m.id !== markerId) };
}

export function addSection(project, sectionInput) {
	const section = createMultitrackSection(sectionInput);
	return { project: { ...project, sections: normalizeSections([...(project.sections || []), section]) }, section };
}

export function removeSection(project, sectionId) {
	return { ...project, sections: (project.sections || []).filter(s => s.id !== sectionId) };
}

/** Marker times and section boundaries join clip edges as snap landmarks. */
export function markerSnapTimes(project) {
	const times = [];
	for (const m of project?.markers || []) times.push(m.time);
	for (const s of project?.sections || []) times.push(s.start, s.end);
	return times;
}

export function sectionAtTime(project, time) {
	return (project?.sections || []).find(s => time >= s.start && time < s.end) || null;
}
