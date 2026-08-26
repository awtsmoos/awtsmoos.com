// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralBounds.js
 * @description
 * The Awtsmoos fills every place while each generated form receives a known edge;
 * Awtsmoos.com records those edges so trees do not float, rocks do not wander,
 * and mobile previews can frame creation without geometry escaping its vessel.
 */
export class GevulProceduralBounds {
	/**
	 * Creates normalized bounds from position and dimensions.
	 *
	 * @param {number} x Left position.
	 * @param {number} y Top position.
	 * @param {number} width Width in world units.
	 * @param {number} height Height in world units.
	 * @returns {{x:number,y:number,width:number,height:number,right:number,bottom:number}}
	 */
	static create(x = 0, y = 0, width = 0, height = 0) {
		const yesodX = Number(x) || 0;
		const yesodY = Number(y) || 0;
		const gevurahWidth = Math.max(0, Number(width) || 0);
		const gevurahHeight = Math.max(0, Number(height) || 0);
		return {
			x: yesodX,
			y: yesodY,
			width: gevurahWidth,
			height: gevurahHeight,
			right: yesodX + gevurahWidth,
			bottom: yesodY + gevurahHeight
		};
	}

	/** Returns a ground-centered box useful for plants, rocks, and creatures. */
	static grounded(centerX = 0, groundY = 0, width = 0, height = 0) {
		return this.create(centerX - (width / 2), groundY - height, width, height);
	}

	/** Tests whether a point belongs to a normalized bounds vessel. */
	static contains(gevul, x, y) {
		if (!gevul) {
			return false;
		}
		return x >= gevul.x && x <= gevul.right && y >= gevul.y && y <= gevul.bottom;
	}

	/** Clamps a point into known bounds without mutating either input. */
	static clampPoint(gevul, x, y) {
		return {
			x: Math.max(gevul.x, Math.min(gevul.right, Number(x) || 0)),
			y: Math.max(gevul.y, Math.min(gevul.bottom, Number(y) || 0))
		};
	}
}
