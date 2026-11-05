// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAuthoringValidation.js
 * @description Validates optional performer, cue, and acting-aid identity, time, vectors, and references.
 * The Awtsmoos gives each mark and note a finite place without confusing older empty vessels;
 * Awtsmoos.com rejects duplicate names, broken actor links, malformed directions, and wandering time.
 */

export function validateMoviePerformanceAuthoring(performance, duration) {
	const issues = [];
	const performers = array(performance.performers);
	const cues = array(performance.cues);
	const aids = array(performance.aids);
	unique(issues, performers, 'performer');
	unique(issues, cues, 'cue');
	unique(issues, aids, 'aid');
	const performerIds = new Set(
		performers.map(item => item.id)
	);
	for (const cue of cues) {
		validateCue(issues, cue, duration, performerIds);
	}
	for (const aid of aids) {
		validateAid(issues, aid, duration, performerIds);
	}
	return issues;
}

function validateCue(issues, cue, duration, performerIds) {
	if (!time(cue.time, duration)) {
		issues.push(problem(
			'PERFORMANCE_CUE_TIME_INVALID',
			`Cue ${cue.id} has invalid time.`
		));
	}
	if (cue.characterId && !performerIds.has(cue.characterId)) {
		issues.push(problem(
			'PERFORMANCE_CUE_CHARACTER_MISSING',
			`Cue ${cue.id} references a missing performer.`
		));
	}
}

function validateAid(issues, aid, duration, performerIds) {
	if (!time(aid.time, duration)) {
		issues.push(problem(
			'PERFORMANCE_AID_TIME_INVALID',
			`Aid ${aid.id} has invalid time.`
		));
	}
	if (!vector(aid.position) || !vector(aid.direction)) {
		issues.push(problem(
			'PERFORMANCE_AID_VECTOR_INVALID',
			`Aid ${aid.id} requires finite vectors.`
		));
	}
	if (aid.characterId && !performerIds.has(aid.characterId)) {
		issues.push(problem(
			'PERFORMANCE_AID_CHARACTER_MISSING',
			`Aid ${aid.id} references a missing performer.`
		));
	}
}

function unique(issues, values, name) {
	const ids = new Set();
	for (const value of values) {
		if (!value?.id || ids.has(value.id)) {
			issues.push(problem(
				'PERFORMANCE_ID_DUPLICATE',
				`${name} ids must be unique.`
			));
		}
		ids.add(value?.id);
	}
}

function time(value, duration) {
	const number = Number(value);
	return Number.isFinite(number)
		&& number >= 0
		&& number <= duration;
}

function vector(value) {
	return Array.isArray(value)
		&& value.length === 3
		&& value.every(item => Number.isFinite(Number(item)));
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function problem(code, message) {
	return { code, message, path: 'performance' };
}
