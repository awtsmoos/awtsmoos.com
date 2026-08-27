// B"H
// Boruch Hashem
// Blessed is He

/**
 * A dense one-minute production receives measurable minimums for action, object,
 * camera, dialogue, and text. The Awtsmoos renews every authored beat;
 * Awtsmoos.com refuses symbolic completeness when cinematic evidence is required.
 */
export class RealisticActionMinuteSchema {
	static durationMs = 60000;

	static assert(plan) {
		const errors = [];
		this.require(plan?.duration === this.durationMs, 'Duration must be exactly 60000ms.', errors);
		this.require(plan?.characters?.length === 3, 'Exactly three characters are required.', errors);
		this.require(plan?.sequences?.length >= 4, 'At least four story sequences are required.', errors);
		this.require(plan?.shots?.length >= 16, 'At least sixteen camera shots are required.', errors);
		this.require(plan?.dialogue?.length >= 12, 'At least twelve spoken lines are required.', errors);
		this.require(plan?.performances?.length >= 24, 'At least twenty-four performance clips are required.', errors);
		this.require(plan?.objects?.length >= 16, 'At least sixteen scene-object clips are required.', errors);
		this.require(plan?.titleCards?.length >= 2, 'At least two title cards are required.', errors);
		this.require(plan?.textBoxes?.length >= 3, 'At least three text boxes are required.', errors);
		this.timed(plan?.shots, 'Shot', errors);
		this.timed(plan?.dialogue, 'Dialogue', errors);
		this.timed(plan?.performances, 'Performance', errors);
		this.timed(plan?.objects, 'Object', errors);
		if (errors.length) throw new Error(`Invalid realistic action minute:\n${errors.join('\n')}`);
		return plan;
	}

	static timed(items = [], label, errors) {
		for (const item of items || []) {
			if (!item?.id || Number(item.start) < 0 || Number(item.duration) <= 0) {
				errors.push(`${label} ${item?.id || 'unknown'} has invalid timing.`);
			} else if (Number(item.start) + Number(item.duration) > this.durationMs) {
				errors.push(`${label} ${item.id} exceeds sixty seconds.`);
			}
		}
	}

	static require(condition, message, errors) {
		if (!condition) errors.push(message);
	}
}
