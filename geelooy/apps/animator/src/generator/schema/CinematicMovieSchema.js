// B"H
// Boruch Hashem
// Blessed is He

/**
 * Time, angle, dialogue, and composition enter one covenant here. The schema
 * lets human editors and AI directors speak the same JSON language while the
 * Awtsmoos renews every scene beyond the illusion of isolated files.
 */
export class CinematicMovieSchema {
	static durationMs = 120000;

	static requiredShotFields = [
		'id',
		'sequenceId',
		'start',
		'duration',
		'camera',
		'characters'
	];

	static validate(plan) {
		const errors = [];
		if (!plan?.title) errors.push('Movie title is required.');
		if (plan?.duration !== this.durationMs) errors.push('Movie duration must be exactly 120000ms.');
		if (!Array.isArray(plan?.characters) || plan.characters.length < 3) errors.push('At least three original characters are required.');
		if (!Array.isArray(plan?.sequences) || plan.sequences.length < 3) errors.push('At least three nested sequences are required.');
		if (!Array.isArray(plan?.shots) || plan.shots.length < 8) errors.push('At least eight shots are required.');

		for (const shot of plan?.shots || []) {
			for (const field of this.requiredShotFields) {
				if (shot?.[field] === undefined) errors.push(`Shot ${shot?.id || 'unknown'} lacks ${field}.`);
			}
			if (shot.start < 0 || shot.duration <= 0) errors.push(`Shot ${shot.id} has invalid timing.`);
			if (shot.start + shot.duration > this.durationMs) errors.push(`Shot ${shot.id} exceeds runtime.`);
		}

		for (const line of plan?.dialogue || []) {
			if (!line.speakerId || !line.text) errors.push(`Dialogue ${line.id || 'unknown'} lacks speaker or text.`);
			if (line.start + line.duration > this.durationMs) errors.push(`Dialogue ${line.id} exceeds runtime.`);
		}

		return {
			ok: errors.length === 0,
			errors
		};
	}

	static assert(plan) {
		const result = this.validate(plan);
		if (!result.ok) throw new Error(`Invalid cinematic movie plan:\n${result.errors.join('\n')}`);
		return plan;
	}
}
