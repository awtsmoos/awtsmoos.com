//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos remains One while place, date, primary shita, and selected vessels move through human state;
 * Awtsmoos.com restores shared URLs before local memory so an intentional link always opens at its intended gate.
 */

import { normalizeOpinionIds, normalizePrimaryOpinion } from "../config/opinion-selection.js";
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

/** Choose comparison state with URL values taking precedence over remembered local preferences. */
function initialOpinionSelection(shared, saved) {
	if (shared.opinionIds?.length) {
		return shared.opinionIds;
	}
	if (shared.opinionId) {
		return [shared.opinionId];
	}
	if (saved.opinionIds?.length) {
		return saved.opinionIds;
	}
	return [saved.opinionId];
}

/** Observable application state with URL-first hydration and local persistence. */
export class YesodZmanimStore extends EventTarget {
	constructor() {
		super();
		const saved = this.readPreferences();
		const shared = readZmanimUrl();
		const location = shared.location || saved.location || DEFAULT_LOCATION;
		const opinionIds = normalizeOpinionIds(initialOpinionSelection(shared, saved));
		const primaryCandidate = shared.opinionId || saved.opinionId;
		this.state = {
			location,
			opinionIds,
			opinionId: normalizePrimaryOpinion(primaryCandidate, opinionIds),
			date: shared.date || saved.date || MalchusTimeFormatter.todayInZone(location.timezone)
		};
	}

	getSnapshot() {
		return {
			location: { ...this.state.location },
			opinionId: this.state.opinionId,
			opinionIds: [...this.state.opinionIds],
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
		this.setOpinionSelection([opinionId], opinionId);
	}

	setOpinionSelection(opinionIds, primaryOpinionId) {
		const normalized = normalizeOpinionIds(opinionIds);
		this.state.opinionIds = normalized;
		this.state.opinionId = normalizePrimaryOpinion(primaryOpinionId, normalized);
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
			// Persistence is optional; calculation remains usable without storage.
		}
		this.dispatchEvent(new CustomEvent("state-change", {
			detail: this.getSnapshot()
		}));
	}
}
