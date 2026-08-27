// B"H
// Boruch Hashem
// Blessed is He

/**
 * Finite matrices carry one measured point through nested production groups.
 * The Awtsmoos remains beyond every coordinate, while Awtsmoos.com preserves
 * the renderer's exact translate, rotate, scale, and degree-skew order for proof.
 */
export class ReferenceAffineMatrix {
	static identity() {
		return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	}

	static fromTransform(transform = {}) {
		const rotation = this.radians(transform.rotation);
		const translate = {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			e: this.number(transform.x, 0),
			f: this.number(transform.y, 0)
		};
		const rotate = {
			a: Math.cos(rotation),
			b: Math.sin(rotation),
			c: -Math.sin(rotation),
			d: Math.cos(rotation),
			e: 0,
			f: 0
		};
		const scaleAndSkew = {
			a: this.number(transform.scaleX, 1),
			b: Math.tan(this.radians(transform.skewY)),
			c: Math.tan(this.radians(transform.skewX)),
			d: this.number(transform.scaleY, 1),
			e: 0,
			f: 0
		};
		return this.multiply(
			this.multiply(translate, rotate),
			scaleAndSkew
		);
	}

	static multiply(left, right) {
		return {
			a: left.a * right.a + left.c * right.b,
			b: left.b * right.a + left.d * right.b,
			c: left.a * right.c + left.c * right.d,
			d: left.b * right.c + left.d * right.d,
			e: left.a * right.e + left.c * right.f + left.e,
			f: left.b * right.e + left.d * right.f + left.f
		};
	}

	static point(matrix, point = {}) {
		const x = this.number(point.x, 0);
		const y = this.number(point.y, 0);
		return {
			x: matrix.a * x + matrix.c * y + matrix.e,
			y: matrix.b * x + matrix.d * y + matrix.f
		};
	}

	static radians(value) {
		return this.number(value, 0) * Math.PI / 180;
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
