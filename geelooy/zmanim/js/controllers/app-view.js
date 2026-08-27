//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins many visible vessels without forcing the composition root to carry every detail;
 * Awtsmoos.com keeps controls, comparisons, celestial positions, and primary context synchronized in one readable reveal.
 */

import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Synchronize the page's custom elements and textual context from one comparison bundle. */
export class MalchusAppView {
	constructor(elements) {
		this.elements = elements;
	}

	/** Sync controls that represent state rather than calculated values. */
	syncControls(state, civilDate, hebrewDate, comparison) {
		this.elements.location.selectedLocation = state.location;
		this.elements.date.data = {
			date: state.date,
			civilDate,
			hebrewDate
		};
		this.elements.opinionCards.data = {
			opinionIds: comparison.opinionIds,
			primaryOpinionId: comparison.primaryOpinionId
		};
	}

	/** Send primary data to concise/celestial widgets and the full set to the comparison grid. */
	syncDashboard(state, civilDate, comparison) {
		const primaryShared = {
			times: comparison.primary.times,
			timezone: state.location.timezone,
			status: comparison.status
		};
		this.elements.next.data = {
			status: comparison.status,
			timezone: state.location.timezone,
			dateLabel: civilDate
		};
		this.elements.keyTimes.data = primaryShared;
		this.elements.timeline.data = primaryShared;
		this.elements.celestial.data = {
			...primaryShared,
			location: state.location,
			date: state.date
		};
		this.elements.grid.data = {
			calculations: comparison.calculations,
			primaryOpinionId: comparison.primaryOpinionId,
			timezone: state.location.timezone,
			status: comparison.status
		};
		this.elements.share.data = {
			...state,
			times: comparison.primary.times,
			dateLabel: civilDate,
			opinionLabel: comparison.primary.opinion.label
		};
		this.elements.methodology.data = {
			opinionIds: comparison.opinionIds,
			primaryOpinionId: comparison.primaryOpinionId
		};
	}

	/** Update the persistent summary using only the explicitly primary method. */
	syncContext(state, civilDate, comparison) {
		const primary = comparison.primary;
		this.elements.shaah.textContent = MalchusTimeFormatter.seasonalHour(primary.shaahMillis);
		const count = comparison.opinionIds.length;
		this.elements.method.textContent = `${primary.opinion.label} primary · ${count} selected · ${state.location.timezone}`;
		this.elements.stickyPlace.textContent = state.location.name || state.location.label;
		this.elements.stickyDate.textContent = civilDate;
		this.elements.stickyNext.textContent = comparison.status.next
			? `${comparison.status.next.label} · ${MalchusTimeFormatter.time(comparison.status.next.time, state.location.timezone)}`
			: "Selected day";
	}
}
