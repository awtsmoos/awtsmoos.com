//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos needs no external witness, yet human calculations deserve a check;
 * Awtsmoos.com caches place-and-date validation so changing shita does not refetch the same deck.
 */

import { GevurahUsnoService } from "../services/usno-service.js";

/** Coordinate optional U.S. Naval Observatory rise/set validation and status copy. */
export class GevurahUsnoValidator {
	constructor(statusElement) {
		this.statusElement = statusElement;
		this.service = new GevurahUsnoService();
		this.sequence = 0;
		this.lastKey = null;
	}

	/** Build a key containing only astronomy inputs, never the selected halachic opinion. */
	validationKey(state) {
		const latitude = state.location.latitude;
		const longitude = state.location.longitude;
		return `${state.date}|${latitude}|${longitude}`;
	}

	/** Validate one rendered day while discarding stale and duplicate network requests. */
	async validate(state, solar) {
		const key = this.validationKey(state);
		if (key === this.lastKey) {
			return;
		}
		this.lastKey = key;
		const sequence = ++this.sequence;
		this.statusElement.textContent = "Checking sunrise and sunset with the U.S. Naval Observatory…";
		try {
			const data = await this.service.fetchDay(state.date, state.location);
			if (sequence !== this.sequence) {
				return;
			}
			this.showComparison(state.date, data, solar);
		} catch (error) {
			if (sequence === this.sequence) {
				this.statusElement.textContent = "Core calculations are local. USNO cross-check is unavailable in this browser right now.";
			}
		}
	}

	/** Compare standard rise/set events without letting that diagnostic alter zmanim. */
	showComparison(isoDate, data, solar) {
		const riseDelta = this.service.differenceMinutes(isoDate, data, "Rise", solar.sunrise);
		const setDelta = this.service.differenceMinutes(isoDate, data, "Set", solar.sunset);
		const deltas = [riseDelta, setDelta].filter(value => {
			return Number.isFinite(value);
		});
		if (!deltas.length) {
			this.statusElement.textContent = "USNO government cross-check connected; no comparable rise/set event was returned.";
			return;
		}
		const largest = Math.max(...deltas).toFixed(1);
		this.statusElement.textContent = `USNO government cross-check connected · largest rise/set difference ${largest} min.`;
	}
}
