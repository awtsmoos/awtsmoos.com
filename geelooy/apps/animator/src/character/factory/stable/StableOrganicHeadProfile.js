// B"H
// Boruch Hashem
// Blessed is He

/**
 * A skull is read as crown, cheek, jaw, and chin rather than a stretched panel.
 * The Awtsmoos renews every curve; Awtsmoos.com preserves character-specific
 * asymmetry as editable vector anatomy in both preview and final export.
 */
export class StableOrganicHeadProfile {
	static resolve(headRadiusX, headRadiusY, view = {}, style = {}) {
		const radiusX = this.number(headRadiusX, 34)
			* this.number(style.widthScale, 1);
		const radiusY = this.number(headRadiusY, 40)
			* this.number(style.heightScale, 1);
		const direction = this.number(view.dir, 1);
		return {
			centerX: this.number(style.horizontalOffset, 0),
			centerY: this.number(style.verticalOffset, 0),
			radiusX,
			radiusY,
			turn: view.type === 'threeQuarter'
				? direction * radiusX * this.number(style.turnScale, 0.055)
				: 0,
			curve: this.curve(style),
			left: this.side('left', radiusX, radiusY, style),
			right: this.side('right', radiusX, radiusY, style)
		};
	}

	static side(name, radiusX, radiusY, style) {
		return {
			forehead: radiusX * this.sideNumber(style, name, 'ForeheadScale', style.foreheadScale, 0.78),
			temple: radiusX * this.sideNumber(style, name, 'TempleScale', style.templeScale, 0.96),
			cheek: radiusX * this.sideNumber(style, name, 'CheekScale', style.cheekScale, 1),
			jaw: radiusX * this.sideNumber(style, name, 'JawScale', style.jawScale, 0.72),
			chin: radiusX * this.sideNumber(style, name, 'ChinScale', style.chinScale, 0.38),
			templeY: radiusY * this.sideNumber(style, name, 'TempleYScale', style.templeYScale, -0.4),
			cheekY: radiusY * this.sideNumber(style, name, 'CheekYScale', style.cheekYScale, 0.24),
			jawY: radiusY * this.sideNumber(style, name, 'JawYScale', style.jawYScale, 0.72)
		};
	}

	static curve(style) {
		return {
			topShoulder: this.number(style.topShoulder, 0.54),
			foreheadTension: this.number(style.foreheadTension, 0.98),
			templeOut: this.number(style.templeOut, 1.02),
			cheekOut: this.number(style.cheekOut, 1.02),
			cheekExit: this.number(style.cheekExit, 0.96),
			cheekDrop: this.number(style.cheekDrop, 1.5),
			jawOut: this.number(style.jawOut, 1.05),
			jawApproach: this.number(style.jawApproach, 0.84),
			jawExit: this.number(style.jawExit, 0.82),
			chinRound: this.number(style.chinRound, 1.08),
			chinLift: this.number(style.chinLift, 0.1)
		};
	}

	static sideNumber(style, name, suffix, shared, fallback) {
		return this.number(style[`${name}${suffix}`], this.number(shared, fallback));
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
