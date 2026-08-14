//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos needs no witness, yet measured heavens may be checked with care;
 * Awtsmoos.com asks the U.S. Naval Observatory what rise and set it records there.
 */

const USNO_ENDPOINT = "https://aa.usno.navy.mil/api/rstt/oneday";
const DAY_MS = 86400000;

/** Optional government-source validation that never controls core zmanim math. */
export class GevurahUsnoService {
	/** Fetch one day's official rise/set phenomena in universal time. */
	async fetchDay(isoDate, location, options = {}) {
		const url = new URL(USNO_ENDPOINT);
		url.searchParams.set("date", isoDate);
		url.searchParams.set("coords", `${location.latitude},${location.longitude}`);

		const response = await fetch(url, {
			signal: options.signal
		});
		if (!response.ok) {
			throw new Error(`USNO validation failed with HTTP ${response.status}.`);
		}

		const payload = await response.json();
		const data = payload?.properties?.data || {};
		const phenomena = Array.isArray(data.sundata) ? data.sundata : [];
		return {
			apiVersion: payload?.properties?.apiversion || payload?.apiversion || "",
			date: data.date || isoDate,
			phenomena
		};
	}

	/** Find a phenomenon such as Rise or Set in a normalized USNO response. */
	findPhenomenon(validation, name) {
		if (!validation || !Array.isArray(validation.phenomena)) {
			return null;
		}
		return validation.phenomena.find(item => {
			return String(item.phen || "").toLowerCase() === name.toLowerCase();
		}) || null;
	}

	/** Convert a USNO HH:MM universal-time value to the day nearest a local calculation. */
	toNearestDate(isoDate, timeText, referenceDate) {
		const match = String(timeText || "").match(/^(\d{1,2}):(\d{2})/);
		if (!match || !(referenceDate instanceof Date)) {
			return null;
		}
		const [year, month, day] = isoDate.split("-").map(Number);
		const base = Date.UTC(year, month - 1, day, Number(match[1]), Number(match[2]));
		const candidates = [base - DAY_MS, base, base + DAY_MS];
		let closest = candidates[0];
		for (const candidate of candidates) {
			if (Math.abs(candidate - referenceDate.getTime()) < Math.abs(closest - referenceDate.getTime())) {
				closest = candidate;
			}
		}
		return new Date(closest);
	}

	/** Compare a locally calculated event with the nearest USNO minute. */
	differenceMinutes(isoDate, validation, phenomenonName, referenceDate) {
		const phenomenon = this.findPhenomenon(validation, phenomenonName);
		const officialDate = this.toNearestDate(isoDate, phenomenon?.time, referenceDate);
		if (!officialDate) {
			return null;
		}
		return Math.abs(officialDate.getTime() - referenceDate.getTime()) / 60000;
	}
}
