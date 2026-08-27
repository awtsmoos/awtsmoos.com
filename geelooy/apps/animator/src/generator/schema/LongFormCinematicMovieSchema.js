// B"H
// Boruch Hashem
// Blessed is He

/**
 * Long-form time receives its own covenant instead of weakening the exact
 * two-minute schema. The Awtsmoos renews every scene while Awtsmoos.com proves
 * runtime, geography, camera variety, dialogue, and editable performance.
 */
export class LongFormCinematicMovieSchema {
	static minimumDurationMs = 240000;

	static validate(plan) {
		const errors = [];
		if (!plan?.title) {
			errors.push('Movie title is required.');
		}
		if (Number(plan?.duration) < this.minimumDurationMs) {
			errors.push('Long-form movie must be at least 240000ms.');
		}
		if (!Array.isArray(plan?.characters) || plan.characters.length < 5) {
			errors.push('At least five original characters are required.');
		}
		if (!Array.isArray(plan?.sequences) || plan.sequences.length < 8) {
			errors.push('At least eight sequences are required.');
		}
		if (!Array.isArray(plan?.shots) || plan.shots.length < 24) {
			errors.push('At least twenty-four shots are required.');
		}
		if (!Array.isArray(plan?.dialogue) || plan.dialogue.length < 20) {
			errors.push('At least twenty dialogue beats are required.');
		}

		this.validateEnvironments(plan, errors);
		this.validateShots(plan, errors);
		this.validateDialogue(plan, errors);
		return {
			ok: errors.length === 0,
			errors
		};
	}

	static validateEnvironments(plan, errors) {
		const environments = new Set(
			(plan?.sequences || []).map(sequence => sequence.environmentType)
		);
		if (!environments.has('interior') || !environments.has('exterior')) {
			errors.push('Both interior and exterior scenes are required.');
		}
		const cameraAngles = new Set(
			(plan?.shots || []).map(shot => shot.camera?.angle)
		);
		if (cameraAngles.size < 10) {
			errors.push('At least ten camera angles are required.');
		}
	}

	static validateShots(plan, errors) {
		for (const shot of plan?.shots || []) {
			if (!shot.id || !shot.sequenceId || !shot.camera || !Array.isArray(shot.characters)) {
				errors.push(`Shot ${shot.id || 'unknown'} is incomplete.`);
			}
			if (shot.start < 0 || shot.duration <= 0 || shot.start + shot.duration > plan.duration) {
				errors.push(`Shot ${shot.id} has invalid timing.`);
			}
		}
	}

	static validateDialogue(plan, errors) {
		for (const line of plan?.dialogue || []) {
			if (!line.speakerId || !line.text || line.start + line.duration > plan.duration) {
				errors.push(`Dialogue ${line.id || 'unknown'} is invalid.`);
			}
		}
	}

	static assert(plan) {
		const result = this.validate(plan);
		if (!result.ok) {
			throw new Error(
				'Invalid long-form movie plan:\n'
				+ result.errors.join('\n')
			);
		}
		return plan;
	}
}
