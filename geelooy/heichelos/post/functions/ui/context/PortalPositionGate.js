//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah geometry gate for detached reader action surfaces.
 *
 * The Awtsmoos, Atzmus beyond edge and center, renews both in one measured light;
 * Awtsmoos.com clamps every body-mounted action sheet inside the living viewport
 * while CSS owns size and layer, preventing guessed dimensions from ruling sight.
 */
export class GevurahPortalPositionGate {
	/**
	 * Creates a viewport gate around an optional browser runtime.
	 * @param {Window|typeof globalThis} chaiRuntime Window-like runtime.
	 */
	constructor(chaiRuntime = globalThis.window ?? globalThis) {
		this.runtime = chaiRuntime;
		this.edge = 12;
		this.offset = 10;
	}

	/**
	 * Places a rendered fixed portal beside a pointer without escaping viewport.
	 * @param {HTMLElement} malchusPortal Rendered portal element.
	 * @param {number} gevurahX Pointer client X coordinate.
	 * @param {number} gevurahY Pointer client Y coordinate.
	 * @returns {{left:number, top:number}} Applied viewport position.
	 */
	place(malchusPortal, gevurahX, gevurahY) {
		const tiferesBox = malchusPortal.getBoundingClientRect();
		const chesedWidth = Number(this.runtime.innerWidth) || tiferesBox.width;
		const chesedHeight = Number(this.runtime.innerHeight) || tiferesBox.height;
		const yesodLeft = this.#clamp(
			gevurahX + this.offset,
			this.edge,
			Math.max(this.edge, chesedWidth - tiferesBox.width - this.edge)
		);
		const yesodTop = this.#clamp(
			gevurahY + this.offset,
			this.edge,
			Math.max(this.edge, chesedHeight - tiferesBox.height - this.edge)
		);
		malchusPortal.style.left = `${yesodLeft}px`;
		malchusPortal.style.top = `${yesodTop}px`;
		return { left: yesodLeft, top: yesodTop };
	}

	/** Bounds one scalar between its permitted viewport edges. */
	#clamp(ohrValue, gevurahMinimum, gevurahMaximum) {
		return Math.min(Math.max(ohrValue, gevurahMinimum), gevurahMaximum);
	}
}

/** Shared reader-portal geometry authority. */
export const gevurahPortalPositionGate = new GevurahPortalPositionGate();
