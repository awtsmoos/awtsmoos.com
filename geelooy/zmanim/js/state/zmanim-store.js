//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos remains One while place, date, and shita move through human state;
 * Awtsmoos.com restores shared URLs first, then local memory, so a sent link opens at the intended gate.
 */

import { getZmanimOpinion } from "../config/opinions.js";
import { addIsoDays } from "../domain/solar-events.js";
import { MalchusTimeFormatter } from "../domain/timezone.js";
import { readZmanimUrl } from "./url-state.js";

const STORAGE_KEY = "awtsmoos-zmanim-preferences-v2";
const DEFAULT_LOCATION = Object.freeze({
	id: "brooklyn-default",
	name: "Brooklyn",
	admin1: "New York",
	country: "United States",
	latitude: 40.6501,
	longitude: -73.9496,
	elevation: null,
	timezone: "America/New_York",
	label: "Brooklyn, New York, United States"
});

/** Observable application state with URL-first hydration and local persistence. */
export class YesodZmanimStore extends EventTarget {
	constructor() {
		super();
		const saved = this.readPreferences();
		const shared = readZmanimUrl();
		const location = shared.location || saved.location || DEFAULT_LOCATION;
		this.state = {
			location,
			opinionId: getZmanimOpinion(shared.opinionId || saved.opinionId).id,
			date: shared.date || saved.date || MalchusTimeFormatter.todayInZone(location.timezone)
		};
	}

	getSnapshot() {
		return {
			location: { ...this.state.location },
			opinionId: this.state.opinionId,
			date: this.state.date
		};
	}

	setLocation(location) {
		this.state.location = { ...location };
		this.persistAndNotify();
	}

	setDate(isoDate) {
		if (this.isValidDate(isoDate)) {
			this.state.date = isoDate;
			this.persistAndNotify();
		}
	}

	navigateDate(dayDelta) {
		this.setDate(addIsoDays(this.state.date, dayDelta));
	}

	goToday() {
		this.setDate(MalchusTimeFormatter.todayInZone(this.state.location.timezone));
	}

	setOpinion(opinionId) {
		this.state.opinionId = getZmanimOpinion(opinionId).id;
		this.persistAndNotify();
	}

	isValidDate(isoDate) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ""))) {
			return false;
		}
		const [year, month, day] = isoDate.split("-").map(Number);
		return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === isoDate;
	}

	readPreferences() {
		try {
			return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || "{}") || {};
		} catch (error) {
			return {};
		}
	}

	persistAndNotify() {
		try {
			globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
		} catch (error) {
			// Persistence is optional; the calculator remains fully usable without storage.
		}
		this.dispatchEvent(new CustomEvent("state-change", {
			detail: this.getSnapshot()
		}));
	}
}
