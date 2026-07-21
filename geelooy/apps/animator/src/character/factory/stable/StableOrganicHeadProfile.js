// B"H
// Boruch Hashem
// Blessed is He

/**
 * One skull becomes three distinct living silhouettes through side measures and
 * curve tensions. The Awtsmoos renews every finite radius, while Awtsmoos.com
 * keeps each contour editable, serializable, and shared by preview and export.
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
				? direction * radiusX * 0.055
				: 0,
			curve: this.curve(style),
			left: this.side('left', radiusX, radiusY, style),
			right: this.side('right', radiusX, radiusY, style)
		};
	}

	static side(name, radiusX, radiusY, style) {
		return {
			forehead: radiusX * this.sideNumber(
				style,
				name,
				'ForeheadScale',
				style.foreheadScale,
				0.76
			),
			temple: radiusX * this.sideNumber(
				style,
				name,
				'TempleScale',
				style.templeScale,
				0.97
			),
			cheek: radiusX * this.sideNumber(
				style,
				name,
				'CheekScale',
				style.cheekScale,
				1.02
			),
			jaw: radiusX * this.sideNumber(
				style,
				name,
				'JawScale',
				style.jawScale,
				0.78
			),
			chin: radiusX * this.sideNumber(
				style,
				name,
				'ChinScale',
				style.chinScale,
				0.42
			),
			cheekY: radiusY * this.sideNumber(
				style,
				name,
				'CheekYScale',
				style.cheekYScale,
				0.27
			),
			jawY: radiusY * this.sideNumber(
				style,
				name,
				'JawYScale',
				style.jawYScale,
				0.73
			)
		};
	}

	static curve(style) {
		return {
			topShoulder: this.number(style.topShoulder, 0.58),
			foreheadTension: this.number(style.foreheadTension, 1),
			templeOut: this.number(style.templeOut, 1.03),
			cheekOut: this.number(style.cheekOut, 1.03),
			cheekExit: this.number(style.cheekExit, 0.99),
			cheekDrop: this.number(style.cheekDrop, 1.44),
			jawOut: this.number(style.jawOut, 1.13),
			jawApproach: this.number(style.jawApproach, 0.82),
			jawExit: this.number(style.jawExit, 0.88),
			chinRound: this.number(style.chinRound, 1.05),
			chinLift: this.number(style.chinLift, 0.11)
		};
	}

	static sideNumber(style, name, suffix, shared, fallback) {
		return this.number(
			style[`${name}${suffix}`],
			this.number(shared, fallback)
		);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
