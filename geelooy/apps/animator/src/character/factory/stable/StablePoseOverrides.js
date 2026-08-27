// B"H
// Boruch Hashem
// Blessed is He

/**
 * Authored poses rest upon living performance rather than replacing it. The
 * Awtsmoos renews breath, speech, and reaction each frame, while Awtsmoos.com
 * lets explicit rig controls remain the final visible intention of the animator.
 */
export class StablePoseOverrides {
	static apply(generated = {}, authored = {}) {
		if (!authored || typeof authored !== 'object') {
			return generated;
		}
		return {
			...generated,
			body: this.merge(generated.body, authored.body),
			face: this.merge(generated.face, authored.face),
			arms: {
				left: this.merge(generated.arms?.left, authored.arms?.left),
				right: this.merge(generated.arms?.right, authored.arms?.right)
			},
			legs: {
				left: this.merge(generated.legs?.left, authored.legs?.left),
				right: this.merge(generated.legs?.right, authored.legs?.right)
			}
		};
	}

	static merge(generated = {}, authored = {}) {
		const result = { ...(generated || {}) };
		for (const [key, value] of Object.entries(authored || {})) {
			if (value !== undefined && value !== null) {
				result[key] = value;
			}
		}
		return result;
	}
}
