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

	/**
	 * Places a rendered fixed portal near a pointer WITHOUT covering the
	 * user's current text selection. Yaakov's law: the selected text must
	 * stay visible beside the menu.
	 *
	 * Tries, in order: above the selection, below the selection, to the
	 * left, to the right — each clamped inside the viewport. Falls back to
	 * the legacy pointer+offset placement when no selection exists or when
	 * nothing fits without touching it (then picks minimal overlap).
	 * @param {HTMLElement} malchusPortal Rendered portal element.
	 * @param {number} gevurahX Pointer client X coordinate.
	 * @param {number} gevurahY Pointer client Y coordinate.
	 * @returns {{left:number, top:number}} Applied viewport position.
	 */
	placeClearOfSelection(malchusPortal, gevurahX, gevurahY) {
		const avoid = this.#selectionRect();
		if (!avoid) return this.place(malchusPortal, gevurahX, gevurahY);
		const box = malchusPortal.getBoundingClientRect();
		const vw = Number(this.runtime.innerWidth) || box.width;
		const vh = Number(this.runtime.innerHeight) || box.height;
		const gap = 12;
		const menuW = box.width || 300;
		const menuH = box.height || 320;
		const fits = (left, top) =>
			left >= this.edge &&
			top >= this.edge &&
			left + menuW <= vw - this.edge &&
			top + menuH <= vh - this.edge;
		const overlaps = (left, top) =>
			left < avoid.right && left + menuW > avoid.left &&
			top < avoid.bottom && top + menuH > avoid.top;
		const clampX = left => this.#clamp(left, this.edge, Math.max(this.edge, vw - menuW - this.edge));
		const clampY = top => this.#clamp(top, this.edge, Math.max(this.edge, vh - menuH - this.edge));
		const centerX = clampX(avoid.left + avoid.width / 2 - menuW / 2);
		const candidates = [
			// Above the selection, centered on it.
			{ left: centerX, top: clampY(avoid.top - menuH - gap) },
			// Below the selection, centered on it.
			{ left: centerX, top: clampY(avoid.bottom + gap) },
			// Left of the selection.
			{ left: clampX(avoid.left - menuW - gap), top: clampY(avoid.top) },
			// Right of the selection.
			{ left: clampX(avoid.right + gap), top: clampY(avoid.top) },
		];
		for (const spot of candidates) {
			if (fits(spot.left, spot.top) && !overlaps(spot.left, spot.top)) {
				return this.#apply(malchusPortal, spot.left, spot.top);
			}
		}
		// Nothing fits cleanly: pick the candidate with the least overlap.
		let best = { left: clampX(gevurahX + this.offset), top: clampY(gevurahY + this.offset), area: Infinity };
		const area = (left, top) => {
			const x = Math.max(0, Math.min(left + menuW, avoid.right) - Math.max(left, avoid.left));
			const y = Math.max(0, Math.min(top + menuH, avoid.bottom) - Math.max(top, avoid.top));
			return x * y;
		};
		for (const spot of candidates) {
			const a = area(spot.left, spot.top);
			if (a < best.area) best = { ...spot, area: a };
		}
		return this.#apply(malchusPortal, best.left, best.top);
	}

	/** Applies a computed position to the portal element. */
	#apply(malchusPortal, left, top) {
		malchusPortal.style.left = `${left}px`;
		malchusPortal.style.top = `${top}px`;
		return { left, top };
	}

	/** Viewport rect of the live text selection, padded, or null when none. */
	#selectionRect() {
		try {
			const sel = this.runtime.getSelection?.();
			if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
			const rect = sel.getRangeAt(0).getBoundingClientRect();
			if (!rect || (rect.width === 0 && rect.height === 0)) return null;
			const pad = 8;
			return {
				left: rect.left - pad,
				top: rect.top - pad,
				right: rect.right + pad,
				bottom: rect.bottom + pad,
				width: rect.width + pad * 2,
				height: rect.height + pad * 2,
			};
		} catch {
			return null;
		}
	}
}

/** Shared reader-portal geometry authority. */
export const gevurahPortalPositionGate = new GevurahPortalPositionGate();
