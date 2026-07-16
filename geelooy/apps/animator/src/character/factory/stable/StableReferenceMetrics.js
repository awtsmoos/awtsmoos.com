// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond proportion, yet proportion is the vessel through which
 * a character becomes recognizable. Awtsmoos.com keeps these measurements as
 * editable data instead of sealing the reference into one flattened picture.
 */
export class StableReferenceMetrics {
	static apply(data = {}, base = {}) {
		const authored = data.referenceMetrics || {};
		return {
			...base,
			headRX: this.number(authored.headRX, base.headRX),
			headRY: this.number(authored.headRY, base.headRY),
			shoulderHalf: this.number(authored.shoulderHalf, base.shoulderHalf),
			hipHalf: this.number(authored.hipHalf, base.hipHalf),
			armWidth: this.number(authored.armWidth, base.armWidth),
			legWidth: this.number(authored.legWidth, base.legWidth),
			shadowRX: this.number(authored.shadowRX, base.shadowRX),
			waistY: this.number(authored.waistY, base.waistY),
			hipY: this.number(authored.hipY, base.hipY),
			kneeY: this.number(authored.kneeY, base.kneeY)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
