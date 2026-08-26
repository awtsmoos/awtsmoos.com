//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns the command palette's one active row so pointer and keyboard navigation share a single measured vessel.
 * @description The Awtsmoos lets motion through many choices remain one coherent line of intent and light;
 * Awtsmoos.com keeps indexing, wrapping, accessibility, and scrolling outside the controller so each responsibility stays right.
 */
export class GevurahPaletteNavigation {
	constructor() {
		this.activeIndex = 0;
	}

	/** Resets navigation to the first result whenever a new palette session or query begins. */
	reset() {
		this.activeIndex = 0;
	}

	/** Clamps the active index after result count changes without inventing selection beyond visible rows. */
	clamp(length) {
		this.activeIndex = Math.min(
			this.activeIndex,
			Math.max(0, length - 1)
		);
	}

	/** Activates one pointer- or focus-selected row and synchronizes accessible state without rebuilding results. */
	activate(index, list) {
		this.activeIndex = index;
		this.sync(list, false);
	}

	/** Moves cyclically across visible result rows and keeps keyboard movement inside the scroll viewport. */
	move(delta, length, list) {
		if (!length) {
			return;
		}
		this.activeIndex = (
			this.activeIndex
			+ delta
			+ length
		) % length;
		this.sync(list, true);
	}

	/** Returns the currently active command from one already-derived visible result list. */
	selected(commands) {
		return commands[this.activeIndex] || null;
	}

	/** Synchronizes visual and ARIA selection, optionally scrolling only the active row into view. */
	sync(list, scroll) {
		const rows = [
			...list.querySelectorAll(".command-row")
		];
		rows.forEach((row, index) => {
			const active = index === this.activeIndex;
			row.classList.toggle("is-active", active);
			row.setAttribute(
				"aria-selected",
				active ? "true" : "false"
			);
		});
		if (scroll) {
			rows[this.activeIndex]?.scrollIntoView({
				block: "nearest"
			});
		}
	}
}
