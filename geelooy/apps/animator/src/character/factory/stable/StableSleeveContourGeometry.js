// B"H
// Boruch Hashem
// Blessed is He

/**
 * A finite sleeve receives weight, bend, and cloth asymmetry from three anchors.
 * The Awtsmoos gives continuity to those measures, while Awtsmoos.com preserves
 * a reusable procedural contour instead of freezing one character into a sprite.
 */
export class StableSleeveContourGeometry {
	static resolve(shoulder, elbow, wrist, widths = {}) {
		const upper = this.vector(shoulder, elbow);
		const lower = this.vector(elbow, wrist);
		const tangent = this.blend(upper.direction, lower.direction);
		const elbowNormal = this.blend(upper.normal, lower.normal);
		const bend = this.cross(upper.direction, lower.direction);
		const radii = {
			shoulder: Math.max(2, Number(widths.shoulder || 14) * 0.5),
			elbow: Math.max(2, Number(widths.elbow || 12) * 0.5),
			wrist: Math.max(1.6, Number(widths.wrist || 9) * 0.5)
		};
		const outerSide = bend >= 0 ? 1 : -1;
		return {
			upper,
			lower,
			tangent,
			radii,
			outerSide,
			left: this.side(1, shoulder, elbow, wrist, upper, lower, elbowNormal, radii, outerSide),
			right: this.side(-1, shoulder, elbow, wrist, upper, lower, elbowNormal, radii, outerSide)
		};
	}

	static side(side, shoulder, elbow, wrist, upper, lower, elbowNormal, radii, outerSide) {
		const outside = side === outerSide;
		return {
			shoulder: this.offset(shoulder, upper.normal, radii.shoulder * (outside ? 1 : 0.9) * side),
			elbow: this.offset(elbow, elbowNormal, radii.elbow * (outside ? 1.12 : 0.76) * side),
			wrist: this.offset(wrist, lower.normal, radii.wrist * side)
		};
	}

	static controls(side, geometry) {
		const edge = side > 0 ? geometry.left : geometry.right;
		const outside = side === geometry.outerSide;
		const shoulderBulge = geometry.radii.shoulder * (outside ? 0.22 : 0.06) * side;
		const wristBulge = geometry.radii.wrist * (outside ? 0.12 : -0.03) * side;
		return {
			upperOne: this.travel(edge.shoulder, geometry.upper, 0.34, shoulderBulge),
			upperTwo: this.elbowControl(edge.elbow, geometry.tangent, -geometry.upper.length * 0.2),
			lowerOne: this.elbowControl(edge.elbow, geometry.tangent, geometry.lower.length * 0.2),
			lowerTwo: this.travel(edge.wrist, geometry.lower, -0.34, wristBulge)
		};
	}

	static elbowControl(point, tangent, distance) {
		return {
			x: point.x + tangent.x * distance,
			y: point.y + tangent.y * distance
		};
	}

	static travel(point, vector, progress, normalDistance) {
		return {
			x: point.x + vector.direction.x * vector.length * progress
				+ vector.normal.x * normalDistance,
			y: point.y + vector.direction.y * vector.length * progress
				+ vector.normal.y * normalDistance
		};
	}

	static vector(start, end) {
		const x = end.x - start.x;
		const y = end.y - start.y;
		const length = Math.max(1, Math.hypot(x, y));
		return {
			length,
			direction: { x: x / length, y: y / length },
			normal: { x: -y / length, y: x / length }
		};
	}

	static blend(first, second) {
		const x = first.x + second.x;
		const y = first.y + second.y;
		const length = Math.max(0.001, Math.hypot(x, y));
		return { x: x / length, y: y / length };
	}

	static cross(first, second) {
		return first.x * second.y - first.y * second.x;
	}

	static offset(point, normal, distance) {
		return { x: point.x + normal.x * distance, y: point.y + normal.y * distance };
	}
}
