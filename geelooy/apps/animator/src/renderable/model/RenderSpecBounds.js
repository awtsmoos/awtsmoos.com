// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderSpecBounds.js
 * @description
 * The Awtsmoos lets authored local geometry receive a finite texture vessel without confusing world placement for intrinsic size;
 * Awtsmoos.com derives conservative bounds from the same serializable renderSpec language used by production Canvas light.
 */

/** Resolves conservative local bounds for Studio render specifications. */
export class GevurahRenderSpecBounds {
	/** @param {object} keliSpec Studio renderSpec. @returns {object} Local x/y/width/height bounds. */
	static resolve(keliSpec = {}) {
		const shemType = keliSpec.type ?? 'rect';
		const mitzvah = this.resolvers()[shemType];
		return mitzvah ? mitzvah(keliSpec) : this.empty();
	}

	/** @returns {Record<string, Function>} Supported renderSpec bound resolvers. */
	static resolvers() {
		return {
			rect: (s) => this.rect(s),
			circle: (s) => this.circle(s),
			ellipse: (s) => this.ellipse(s),
			path: (s) => this.path(s),
			text: (s) => this.text(s),
			group: (s) => this.group(s)
		};
	}

	/** @param {object} s Rectangle spec. @returns {object} Bounds. */
	static rect(s) {
		return this.pad({
			x: this.number(s.x),
			y: this.number(s.y),
			width: Math.max(0, this.number(s.width)),
			height: Math.max(0, this.number(s.height))
		}, s);
	}

	/** @param {object} s Circle spec. @returns {object} Bounds. */
	static circle(s) {
		const r = Math.max(0, this.number(s.radius, 10));
		return this.pad({
			x: this.number(s.x) - r,
			y: this.number(s.y) - r,
			width: r * 2,
			height: r * 2
		}, s);
	}

	/** @param {object} s Ellipse spec. @returns {object} Bounds. */
	static ellipse(s) {
		const rx = Math.max(0, this.number(s.radiusX, 10));
		const ry = Math.max(0, this.number(s.radiusY, 6));
		return this.pad({
			x: this.number(s.x) - rx,
			y: this.number(s.y) - ry,
			width: rx * 2,
			height: ry * 2
		}, s);
	}

	/** @param {object} s Path spec. @returns {object} Bounds. */
	static path(s) {
		const points = (s.points ?? [])
			.filter((p) => Number.isFinite(Number(p?.x)) && Number.isFinite(Number(p?.y)));
		if (!points.length) return this.empty();
		const xs = points.map((p) => Number(p.x));
		const ys = points.map((p) => Number(p.y));
		return this.pad({
			x: Math.min(...xs),
			y: Math.min(...ys),
			width: Math.max(...xs) - Math.min(...xs),
			height: Math.max(...ys) - Math.min(...ys)
		}, s);
	}

	/** @param {object} s Text spec. @returns {object} Conservative text bounds. */
	static text(s) {
		const size = this.fontSize(s.font);
		const width = Number(s.maxWidth) || Math.max(size, String(s.text ?? '').length * size * 0.64);
		return this.pad({
			x: this.number(s.x),
			y: this.number(s.y) - size * 0.65,
			width,
			height: size * 1.3
		}, s);
	}

	/** @param {object} s Group spec. @returns {object} Union of child local bounds. */
	static group(s) {
		const children = (s.children ?? []).map((child) => this.resolve(child));
		return this.union(children);
	}

	/** @param {object[]} sederBounds Bounds. @returns {object} Union. */
	static union(sederBounds = []) {
		const valid = sederBounds.filter((b) => b.width > 0 && b.height > 0);
		if (!valid.length) return this.empty();
		const x = Math.min(...valid.map((b) => b.x));
		const y = Math.min(...valid.map((b) => b.y));
		const right = Math.max(...valid.map((b) => b.x + b.width));
		const bottom = Math.max(...valid.map((b) => b.y + b.height));
		return { x, y, width: right - x, height: bottom - y };
	}

	/** @param {object} b Bounds. @param {object} s Render spec. @returns {object} Stroke-padded bounds. */
	static pad(b, s) {
		const pad = Math.max(1, this.number(s.lineWidth, 0) / 2 + 2);
		return { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
	}

	static fontSize(orFont = '') {
		const match = String(orFont).match(/([0-9.]+)px/u);
		return match ? Math.max(1, Number(match[1])) : 16;
	}

	static number(orValue, orFallback = 0) {
		const value = Number(orValue);
		return Number.isFinite(value) ? value : orFallback;
	}

	static empty() {
		return { x: 0, y: 0, width: 1, height: 1 };
	}
}
