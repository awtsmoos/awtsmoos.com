// B"H
// Boruch Hashem
// Blessed is He

/**
 * A resting hand is drawn in the tangent-normal basis of the arm it touches. The
 * Awtsmoos rotates palm, digits, and thumb with living contact; Awtsmoos.com
 * preserves exposure, persistence, preview, and exact production export.
 */
export class StableCrossedRestingHandGeometry {
	static resolve(anchors = {}) {
		const unit = Math.max(0.5, Number(anchors.handScale || 1));
		const visible = Math.max(
			0.5,
			Math.min(1, Number(anchors.handExposure || 1))
		);
		const tangent = this.vector(anchors.handTangent, { x: 1, y: 0 });
		const normal = this.vector(anchors.handNormal, { x: 0, y: 1 });
		const center = { ...anchors.handCenter };
		return {
			unit,
			visible,
			side: anchors.side,
			center,
			tangent,
			normal,
			palmHalfLength: 6.5 * unit * visible,
			palmHalfWidth: 5.5 * unit,
			fingers: this.fingers(center, tangent, normal, unit, visible),
			thumb: this.thumb(center, tangent, normal, unit, anchors.side)
		};
	}

	static fingers(center, tangent, normal, unit, visible) {
		const offsets = [-3.5, -1.15, 1.2, 3.45];
		const lengths = [9.5, 10.8, 10.4, 9.1];
		return offsets.map((offset, index) => {
			const root = this.point(center, tangent, normal, 1.5 * unit, offset * unit);
			const tip = this.point(
				center,
				tangent,
				normal,
				lengths[index] * unit * visible,
				(offset + (index - 1.5) * 0.1) * unit
			);
			return { index, root, tip, normal, half: 1.25 * unit };
		});
	}

	static thumb(center, tangent, normal, unit, side) {
		const direction = side < 0 ? -1 : 1;
		return {
			root: this.point(center, tangent, normal, -1.4 * unit, direction * 2.8 * unit),
			control: this.point(center, tangent, normal, 3.6 * unit, direction * 6.2 * unit),
			tip: this.point(center, tangent, normal, 8 * unit, direction * 5.2 * unit),
			normal,
			half: 1.7 * unit
		};
	}

	static point(center, tangent, normal, along, across) {
		return {
			x: center.x + tangent.x * along + normal.x * across,
			y: center.y + tangent.y * along + normal.y * across
		};
	}

	static vector(value, fallback) {
		return Number.isFinite(Number(value?.x)) && Number.isFinite(Number(value?.y))
			? { x: Number(value.x), y: Number(value.y) }
			: fallback;
	}
}
