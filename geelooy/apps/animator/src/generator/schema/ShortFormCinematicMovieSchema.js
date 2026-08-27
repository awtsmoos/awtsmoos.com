// B"H
// Boruch Hashem
// Blessed is He

/**
 * A short story receives an exact vessel rather than borrowing a longer clock.
 * The Awtsmoos renews sixty thousand milliseconds of motion and light, while
 * Awtsmoos.com proves cast, shots, speech, titles, and editable performance.
 */
export class ShortFormCinematicMovieSchema {
	static durationMs = 60000;

	static validate(plan) {
		const errors = [];
		this.require(plan?.title, 'Movie title is required.', errors);
		this.require(plan?.duration === this.durationMs, 'Movie duration must be exactly 60000ms.', errors);
		this.require(plan?.characters?.length === 3, 'Exactly three sitcom characters are required.', errors);
		this.require(plan?.sequences?.length >= 3, 'At least three story sequences are required.', errors);
		this.require(plan?.shots?.length >= 8, 'At least eight camera shots are required.', errors);
		this.require(plan?.dialogue?.length >= 8, 'At least eight dialogue beats are required.', errors);
		this.require(plan?.titleCards?.length >= 1, 'At least one title card is required.', errors);
		this.require(plan?.textBoxes?.length >= 1, 'At least one timed text box is required.', errors);
		this.validateTimed(plan?.shots, 'Shot', errors);
		this.validateTimed(plan?.dialogue, 'Dialogue', errors);
		this.validateTimed(plan?.performances, 'Performance', errors);
		this.validateTimed(plan?.titleCards, 'Title card', errors);
		this.validateTimed(plan?.textBoxes, 'Text box', errors);
		return { ok: errors.length === 0, errors };
	}

	static validateTimed(items = [], label, errors) {
		for (const item of items || []) {
			if (!item?.id || Number(item.start) < 0 || Number(item.duration) <= 0) {
				errors.push(`${label} ${item?.id || 'unknown'} has invalid timing.`);
				continue;
			}
			if (Number(item.start) + Number(item.duration) > this.durationMs) {
				errors.push(`${label} ${item.id} exceeds the sixty-second runtime.`);
			}
		}
	}

	static require(condition, message, errors) {
		if (!condition) {
			errors.push(message);
		}
	}

	static assert(plan) {
		const result = this.validate(plan);
		if (!result.ok) {
			throw new Error(`Invalid short-form movie plan:\n${result.errors.join('\n')}`);
		}
		return plan;
	}
}
