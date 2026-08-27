//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins place, day, shitos, plain HTML, celestial sky, and living time without dividing their source;
 * Awtsmoos.com composes one calculation flow whose presentation, embeds, and native light remain optional vessels along the course.
 */

import "./state/presentation-bootstrap.js";
import "./components/celestial-panel.js";
import "./components/date-control.js";
import "./components/day-timeline.js";
import "./components/embed-actions.js";
import "./components/key-zmanim.js";
import "./components/location-search.js";
import "./components/methodology-panel.js";
import "./components/next-zman.js";
import "./components/opinion-selector.js";
import "./components/share-actions.js";
import "./components/trust-strip.js";
import "./components/view-mode-control.js";
import "./components/zmanim-grid.js";
import { YesodAppEvents } from "./controllers/app-events.js";
import { MalchusAppView } from "./controllers/app-view.js";
import { GevurahUsnoValidator } from "./controllers/usno-validator.js";
import { NetzachOpinionComparison } from "./domain/opinion-comparison.js";
import { ChochmahSolarEvents } from "./domain/solar-events.js";
import { MalchusTimeFormatter } from "./domain/timezone.js";
import { YesodZmanimStore } from "./state/zmanim-store.js";
import { writeZmanimUrl } from "./state/url-state.js";

/** Thin browser composition root for comparison-aware, presentation-aware Zmanim. */
class ZmanimApp {
	constructor() {
		this.store = new YesodZmanimStore();
		this.elements = this.collectElements();
		this.view = new MalchusAppView(this.elements);
		this.validator = new GevurahUsnoValidator(this.elements.validation);
		this.events = new YesodAppEvents(this.store, state => {
			this.render(state);
		});
		this.events.bind();
		this.render(this.store.getSnapshot());
	}

	/** Collect each DOM vessel once so rendering remains explicit and inexpensive. */
	collectElements() {
		return {
			location: document.querySelector("awtsmoos-location-search"),
			date: document.querySelector("awtsmoos-date-control"),
			next: document.querySelector("awtsmoos-next-zman"),
			keyTimes: document.querySelector("awtsmoos-key-zmanim"),
			timeline: document.querySelector("awtsmoos-day-timeline"),
			celestial: document.querySelector("awtsmoos-celestial-panel"),
			grid: document.querySelector("awtsmoos-zmanim-grid"),
			opinionCards: document.querySelector("awtsmoos-opinion-selector"),
			share: document.querySelector("awtsmoos-share-actions"),
			methodology: document.querySelector("awtsmoos-methodology-panel"),
			shaah: document.querySelector("#seasonal-hour"),
			method: document.querySelector("#method-label"),
			stickyPlace: document.querySelector("#sticky-place"),
			stickyDate: document.querySelector("#sticky-date"),
			stickyNext: document.querySelector("#sticky-next"),
			validation: document.querySelector("#usno-status")
		};
	}

	/** Recalculate selected profiles over one solar model and synchronize every calculation vessel. */
	render(state) {
		const solar = ChochmahSolarEvents.forDate(state.date, state.location);
		const comparison = NetzachOpinionComparison.build(solar, state);
		const civilDate = MalchusTimeFormatter.civilDate(state.date);
		const hebrewDate = MalchusTimeFormatter.hebrewDate(state.date);
		this.view.syncControls(state, civilDate, hebrewDate, comparison);
		this.view.syncDashboard(state, civilDate, comparison);
		this.view.syncContext(state, civilDate, comparison);
		history.replaceState({}, "", writeZmanimUrl(state));
		this.validator.validate(state, solar);
	}
}

new ZmanimApp();
