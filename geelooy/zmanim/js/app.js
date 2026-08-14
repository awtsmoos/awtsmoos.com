//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins place, day, shita, sky, and living time without making the page feel heavy;
 * Awtsmoos.com composes compact controls first, daily meaning second, and full depth when the reader is ready.
 */

import "./components/date-control.js";
import "./components/day-timeline.js";
import "./components/key-zmanim.js";
import "./components/location-search.js";
import "./components/methodology-panel.js";
import "./components/next-zman.js";
import "./components/opinion-selector.js";
import "./components/share-actions.js";
import "./components/trust-strip.js";
import "./components/zmanim-grid.js";
import { ZMANIM_OPINIONS } from "./config/opinions.js";
import { YesodAppEvents } from "./controllers/app-events.js";
import { GevurahUsnoValidator } from "./controllers/usno-validator.js";
import { buildDayStatus } from "./domain/day-status.js";
import { ChochmahSolarEvents } from "./domain/solar-events.js";
import { MalchusTimeFormatter } from "./domain/timezone.js";
import { TiferesZmanimCalculator } from "./domain/zmanim-calculator.js";
import { YesodZmanimStore } from "./state/zmanim-store.js";
import { writeZmanimUrl } from "./state/url-state.js";

/** Thin browser composition root for the daily-first Zmanim experience. */
class ZmanimApp {
	constructor() {
		this.store = new YesodZmanimStore();
		this.elements = this.collectElements();
		this.validator = new GevurahUsnoValidator(this.elements.validation);
		this.events = new YesodAppEvents(this.store, this.elements.opinion, state => {
			this.render(state);
		});
		this.populateOpinions();
		this.events.bind();
		this.render(this.store.getSnapshot());
	}

	collectElements() {
		return {
			location: document.querySelector("awtsmoos-location-search"),
			date: document.querySelector("awtsmoos-date-control"),
			next: document.querySelector("awtsmoos-next-zman"),
			keyTimes: document.querySelector("awtsmoos-key-zmanim"),
			timeline: document.querySelector("awtsmoos-day-timeline"),
			grid: document.querySelector("awtsmoos-zmanim-grid"),
			opinionCards: document.querySelector("awtsmoos-opinion-selector"),
			share: document.querySelector("awtsmoos-share-actions"),
			methodology: document.querySelector("awtsmoos-methodology-panel"),
			opinion: document.querySelector("#zmanim-opinion"),
			shaah: document.querySelector("#seasonal-hour"),
			method: document.querySelector("#method-label"),
			stickyPlace: document.querySelector("#sticky-place"),
			stickyDate: document.querySelector("#sticky-date"),
			stickyNext: document.querySelector("#sticky-next"),
			validation: document.querySelector("#usno-status")
		};
	}

	populateOpinions() {
		for (const opinion of Object.values(ZMANIM_OPINIONS)) {
			const option = document.createElement("option");
			option.value = opinion.id;
			option.textContent = opinion.label;
			this.elements.opinion.append(option);
		}
	}

	render(state) {
		const solar = ChochmahSolarEvents.forDate(state.date, state.location);
		const calculation = TiferesZmanimCalculator.calculate(solar, state.opinionId);
		const status = buildDayStatus(state.date, state.location.timezone, calculation.times);
		const civilDate = MalchusTimeFormatter.civilDate(state.date);
		const hebrewDate = MalchusTimeFormatter.hebrewDate(state.date);
		this.syncControls(state, civilDate, hebrewDate);
		this.syncDashboard(state, calculation, status, civilDate);
		this.syncContext(state, calculation, status, civilDate);
		history.replaceState({}, "", writeZmanimUrl(state));
		this.validator.validate(state, solar);
	}

	syncControls(state, civilDate, hebrewDate) {
		this.elements.location.selectedLocation = state.location;
		this.elements.date.data = { date: state.date, civilDate, hebrewDate };
		this.elements.opinion.value = state.opinionId;
		this.elements.opinionCards.value = state.opinionId;
	}

	syncDashboard(state, calculation, status, civilDate) {
		const shared = { times: calculation.times, timezone: state.location.timezone, status };
		this.elements.next.data = { status, timezone: state.location.timezone, dateLabel: civilDate };
		this.elements.keyTimes.data = shared;
		this.elements.timeline.data = shared;
		this.elements.grid.data = shared;
		this.elements.share.data = { ...state, times: calculation.times, dateLabel: civilDate, opinionLabel: calculation.opinion.label };
		this.elements.methodology.data = { opinionId: state.opinionId };
	}

	syncContext(state, calculation, status, civilDate) {
		this.elements.shaah.textContent = MalchusTimeFormatter.seasonalHour(calculation.shaahMillis);
		this.elements.method.textContent = `${calculation.opinion.label} · ${state.location.timezone}`;
		this.elements.stickyPlace.textContent = state.location.name || state.location.label;
		this.elements.stickyDate.textContent = civilDate;
		this.elements.stickyNext.textContent = status.next
			? `${status.next.label} · ${MalchusTimeFormatter.time(status.next.time, state.location.timezone)}`
			: "Selected day";
	}
}

new ZmanimApp();
