// B"H
// Boruch Hashem
// Blessed is He

/**
 * A hand contact is sampled from the opposite upper arm and carried by its tangent.
 * The Awtsmoos joins skin to living cloth instead of a screen coordinate;
 * Awtsmoos.com preserves relational contact, persistence, preview, and exact export.
 */
export class StableCrossedArmContactResolver {
	static apply(arm = {}, opposite = {}, gesture = {}) {
		const ratio = this.number(
			arm.upper ? gesture.upperContactRatio : gesture.lowerContactRatio,
			arm.upper ? 0.48 : 0.42
		);
		const basis = this.basis(opposite.shoulder, opposite.elbow);
		const contact = this.contact(opposite, basis, ratio, arm, gesture);
		const lead = this.number(gesture.handContactLead, 5.8)
			* arm.handScale
			* arm.handExposure;
		return {
			...arm,
			wrist: {
				x: contact.x - basis.tangent.x * lead,
				y: contact.y - basis.tangent.y * lead
			},
			handCenter: contact,
			handTangent: basis.tangent,
			handNormal: basis.normal,
			contactRatio: ratio,
			contactSegment: {
				start: { ...opposite.shoulder },
				end: { ...opposite.elbow }
			}
		};
	}

	static contact(opposite, basis, ratio, arm, gesture) {
		const offset = this.number(
			arm.upper ? gesture.upperContactOffset : gesture.lowerContactOffset,
			arm.upper ? 1.2 : -0.8
		);
		return {
			x: opposite.shoulder.x
				+ (opposite.elbow.x - opposite.shoulder.x) * ratio
				+ basis.normal.x * offset,
			y: opposite.shoulder.y
				+ (opposite.elbow.y - opposite.shoulder.y) * ratio
				+ basis.normal.y * offset
		};
	}

	static basis(start = {}, end = {}) {
		const dx = Number(start.x || 0) - Number(end.x || 0);
		const dy = Number(start.y || 0) - Number(end.y || 0);
		const length = Math.max(1, Math.hypot(dx, dy));
		const tangent = { x: dx / length, y: dy / length };
		return {
			tangent,
			normal: { x: -tangent.y, y: tangent.x }
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
