//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dream Reader celestial — the sun and moon keep halachic time.
 * @description
 * A subtle sun by day and moon by night, positioned from the EXACT halachic
 * zmanim computed by Awtsmoos.com's own zmanim system (the same
 * ChochmahSolarEvents + TiferesZmanimCalculator the /api/zmanim API uses —
 * no estimates, no approximations of the day structure).
 *
 * The sun's arc follows the halachic day: sunrise at the eastern horizon,
 * chatzos at the zenith, shkia at the western horizon. The moon follows the
 * halachic night: tzeis at the eastern horizon, chatzos halailah at the
 * zenith, alos at the western horizon — with the true astronomical moon
 * phase for the date.
 *
 * Location: a saved location wins; otherwise the IANA timezone maps to
 * approximate coordinates; otherwise Yerushalayim. The CALCULATION is always
 * the exact zmanim system; only the location is best-effort.
 *
 * Performance: zmanim compute once per mount (and hourly); the celestial
 * repositions once per minute via transform only. Zero cost when the dream
 * is off or the user disables it.
 */

import { ChochmahSolarEvents } from "../../../zmanim/js/domain/solar-events.js";
import { TiferesZmanimCalculator } from "../../../zmanim/js/domain/zmanim-calculator.js";

const CELESTIAL_STORAGE_KEY = "awtsmoos-dream-celestial";
const LOCATION_STORAGE_KEY = "awtsmoos-zmanim-location";

/** Approximate coordinates for common IANA timezones (best-effort). */
const TIMEZONE_COORDS = {
	"Asia/Jerusalem": [31.7683, 35.2137],
	"Asia/Tel_Aviv": [32.0853, 34.7818],
	"America/New_York": [40.7128, -74.006],
	"America/Chicago": [41.8781, -87.6298],
	"America/Denver": [39.7392, -104.9903],
	"America/Los_Angeles": [34.0522, -118.2437],
	"America/Toronto": [43.6532, -79.3832],
	"America/Montreal": [45.5017, -73.5673],
	"America/Mexico_City": [19.4326, -99.1332],
	"America/Sao_Paulo": [-23.5558, -46.6396],
	"America/Buenos_Aires": [-34.6037, -58.3816],
	"Europe/London": [51.5074, -0.1278],
	"Europe/Paris": [48.8566, 2.3522],
	"Europe/Berlin": [52.52, 13.405],
	"Europe/Moscow": [55.7558, 37.6173],
	"Africa/Johannesburg": [-26.2041, 28.0473],
	"Asia/Dubai": [25.2048, 55.2708],
	"Asia/Kolkata": [28.6139, 77.209],
	"Asia/Singapore": [1.3521, 103.8198],
	"Asia/Tokyo": [35.6762, 139.6503],
	"Australia/Sydney": [-33.8688, 151.2093],
	"Australia/Melbourne": [-37.8136, 144.9631],
	"Pacific/Auckland": [-36.8485, 174.7633]
};

/** Synodic month in days; reference new moon 2000-01-06 18:14 UTC. */
const SYNODIC_MONTH = 29.53058867;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/**
 * Resolve the location for zmanim: saved > timezone table > Yerushalayim.
 * @returns {{ latitude: number, longitude: number, source: string }}
 */
export function resolveZmanimLocation() {
	try {
		const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
				return { latitude: parsed.latitude, longitude: parsed.longitude, source: "saved" };
			}
		}
	} catch { /* fall through */ }
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const coords = tz && TIMEZONE_COORDS[tz];
		if (coords) {
			return { latitude: coords[0], longitude: coords[1], source: "timezone" };
		}
	} catch { /* fall through */ }
	return { latitude: 31.7683, longitude: 35.2137, source: "yerushalayim" };
}

/**
 * Compute today's exact halachic zmanim via the Awtsmoos zmanim system.
 * @param {Date} [when] Reference date (default now).
 * @returns {{ solar: object, times: object, location: object } | null}
 */
export function computeZmanim(when = new Date()) {
	try {
		const location = resolveZmanimLocation();
		const isoDate = when.toISOString().slice(0, 10);
		// B"H The zmanim modules compute in UTC; the event instants are absolute.
		// We shift the ISO date by the local offset so "today" is the viewer's day.
		const offsetMinutes = -when.getTimezoneOffset();
		const localMidnight = new Date(when);
		localMidnight.setHours(0, 0, 0, 0);
		const localIso = new Date(localMidnight.getTime() - offsetMinutes * 60000)
			.toISOString().slice(0, 10);
		const dateKey = localIso || isoDate;
		const solar = ChochmahSolarEvents.forDate(dateKey, location);
		const calc = TiferesZmanimCalculator.calculate(solar, "chabad");
		return { solar, times: calc.times, location };
	} catch {
		return null;
	}
}

/**
 * Astronomical moon phase 0..1 (0 = new, 0.5 = full).
 * @param {Date} [when] Reference date.
 * @returns {number}
 */
export function moonPhase(when = new Date()) {
	const days = (when.getTime() - REF_NEW_MOON) / 86400000;
	return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;
}

/**
 * Where the sun is on its halachic arc.
 * chatzos = zenith (t=0.5); sunrise/shkia = horizons (t=0 / t=1).
 * @param {Date} now
 * @param {object} times Halachic times from computeZmanim.
 * @returns {{ isDay: boolean, t: number } | null} t: 0..1 along the day arc.
 */
export function sunArcPosition(now, times) {
	const { sunrise, chatzos, sunset } = times;
	if (!(sunrise instanceof Date) || !(chatzos instanceof Date) || !(sunset instanceof Date)) {
		return null;
	}
	const n = now.getTime();
	if (n < sunrise.getTime() || n > sunset.getTime()) {
		return { isDay: false, t: 0 };
	}
	let t;
	if (n <= chatzos.getTime()) {
		const span = chatzos.getTime() - sunrise.getTime();
		t = span > 0 ? 0.5 * (n - sunrise.getTime()) / span : 0.25;
	} else {
		const span = sunset.getTime() - chatzos.getTime();
		t = span > 0 ? 0.5 + 0.5 * (n - chatzos.getTime()) / span : 0.75;
	}
	return { isDay: true, t: Math.min(1, Math.max(0, t)) };
}

/**
 * Where the moon is on its halachic night arc.
 * chatzosHalailah = zenith (t=0.5); tzeis/alos = horizons (t=0 / t=1).
 * @param {Date} now
 * @param {object} times Halachic times from computeZmanim.
 * @returns {{ t: number } | null} t: 0..1 along the night arc.
 */
export function moonArcPosition(now, times) {
	const { tzeis, chatzosHalailah, alos, sunset, sunrise } = times;
	const n = now.getTime();
	// B"H Night arc runs tzeis -> (midnight) -> next alos. We need tomorrow's
	// alos when past midnight; approximate with today's alos + 24h.
	let nightStart = tzeis instanceof Date ? tzeis.getTime() : null;
	let midnight = chatzosHalailah instanceof Date ? chatzosHalailah.getTime() : null;
	let nightEnd = alos instanceof Date ? alos.getTime() : null;
	if (nightStart === null || midnight === null || nightEnd === null) {
		// Fallback to sunset->sunrise when halachic anchors are missing.
		if (!(sunset instanceof Date) || !(sunrise instanceof Date)) return null;
		nightStart = sunset.getTime();
		midnight = nightStart + (sunrise.getTime() + 86400000 - nightStart) / 2;
		nightEnd = sunrise.getTime() + 86400000;
		if (n < nightStart) {
			nightEnd -= 86400000;
			midnight -= 86400000;
			nightStart -= 86400000;
		}
	} else if (nightEnd < nightStart) {
		nightEnd += 86400000;
		if (n < nightStart) {
			nightStart -= 86400000;
			midnight -= 86400000;
			nightEnd -= 86400000;
		}
	}
	if (n < nightStart || n > nightEnd) return null;
	let t;
	if (n <= midnight) {
		const span = midnight - nightStart;
		t = span > 0 ? 0.5 * (n - nightStart) / span : 0.25;
	} else {
		const span = nightEnd - midnight;
		t = span > 0 ? 0.5 + 0.5 * (n - midnight) / span : 0.75;
	}
	return { t: Math.min(1, Math.max(0, t)) };
}

/**
 * Screen position for an arc parameter: sunrise left, zenith top-center,
 * sunset right. Returns viewport percentages.
 * @param {number} t 0..1 along the arc.
 * @returns {{ x: number, y: number }}
 */
export function arcToScreen(t) {
	// B"H x sweeps 8% -> 92%; y follows a sine arc peaking at 12% vh.
	const x = 8 + t * 84;
	const y = 68 - Math.sin(t * Math.PI) * 56;
	return { x, y };
}

/**
 * Warmth 0..1 for the ambient tint: 1 at sunrise/sunset, 0 at zenith.
 * @param {number} t 0..1 along the day arc.
 * @returns {number}
 */
export function dayWarmth(t) {
	return Math.pow(Math.abs(t - 0.5) * 2, 1.5);
}

/**
 * Whether the user enabled the celestial. Default on.
 * @returns {boolean}
 */
export function isCelestialEnabled() {
	try {
		const raw = localStorage.getItem(CELESTIAL_STORAGE_KEY);
		return raw === null ? true : raw !== "off";
	} catch {
		return true;
	}
}

/**
 * Persist the celestial preference.
 * @param {boolean} enabled
 */
export function setCelestialEnabled(enabled) {
	try {
		localStorage.setItem(CELESTIAL_STORAGE_KEY, enabled ? "on" : "off");
	} catch { /* private mode */ }
}

/**
 * Owns the sun/moon DOM and its once-per-minute repositioning.
 */
export class DreamCelestial {
	constructor() {
		this.el = null;
		this.tintEl = null;
		this.timer = null;
		this.zmanimCache = null;
		this.zmanimDay = "";
	}

	/** @returns {void} Create the elements and start the clock. */
	mount() {
		if (typeof document === "undefined" || this.el) return;
		if (!isCelestialEnabled()) return;
		this.el = document.createElement("div");
		this.el.className = "dream-celestial";
		this.el.setAttribute("aria-hidden", "true");
		this.tintEl = document.createElement("div");
		this.tintEl.className = "dream-celestial-tint";
		this.tintEl.setAttribute("aria-hidden", "true");
		document.body.appendChild(this.tintEl);
		document.body.appendChild(this.el);
		this.reposition();
		// B"H The sun crawls ~0.25 degrees a minute; sixty seconds is plenty.
		this.timer = setInterval(() => this.reposition(), 60000);
	}

	/** @returns {void} Remove the elements and stop the clock. */
	unmount() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		for (const el of [this.el, this.tintEl]) {
			if (el) {
				// B"H Instant off: kill the fade, vanish at once.
				el.classList.add("dream-celestial--off");
				if (el.parentNode) el.parentNode.removeChild(el);
			}
		}
		this.el = null;
		this.tintEl = null;
	}

	/** Refresh cached zmanim when the day rolls over. */
	refreshZmanim(now) {
		const dayKey = now.toISOString().slice(0, 10);
		if (!this.zmanimCache || this.zmanimDay !== dayKey) {
			this.zmanimCache = computeZmanim(now);
			this.zmanimDay = dayKey;
		}
		return this.zmanimCache;
	}

	/** @returns {void} Compute and apply the current celestial state. */
	reposition() {
		if (!this.el || !this.tintEl) return;
		const now = new Date();
		const data = this.refreshZmanim(now);
		if (!data || !data.times) return;
		const sun = sunArcPosition(now, data.times);
		if (sun && sun.isDay) {
			this.renderSun(sun.t);
		} else {
			const moon = moonArcPosition(now, data.times);
			if (moon) {
				this.renderMoon(moon.t, moonPhase(now));
			} else {
				// B"H Between arcs (shouldn't happen) — hide gracefully.
				this.el.style.opacity = "0";
				this.tintEl.style.opacity = "0";
			}
		}
	}

	/** @param {number} t 0..1 along the day arc. */
	renderSun(t) {
		const { x, y } = arcToScreen(t);
		const warmth = dayWarmth(t);
		this.el.dataset.body = "sun";
		// B"H Name the hour poetically: alos rose, shkia fire.
		if (t < 0.08) {
			this.el.dataset.phase = "alos";
			this.tintEl.dataset.tint = "rose";
		} else if (t > 0.92) {
			this.el.dataset.phase = "shkia";
			this.tintEl.dataset.tint = "warm";
		} else {
			this.el.dataset.phase = "day";
			this.tintEl.dataset.tint = "warm";
		}
		this.el.style.opacity = "1";
		this.el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) translate(-50%, -50%)`;
		// B"H Golden at the horizons, pale gold at the heights.
		this.el.style.setProperty("--celestial-warmth", warmth.toFixed(3));
		this.tintEl.style.opacity = (0.06 + warmth * 0.10).toFixed(3);
		this.tintEl.style.setProperty("--tint-warmth", warmth.toFixed(3));
	}

	/**
	 * @param {number} t 0..1 along the night arc.
	 * @param {number} phase 0..1 moon phase.
	 */
	renderMoon(t, phase) {
		const { x, y } = arcToScreen(t);
		// B"H Illumination: 0 at new moon, 1 at full.
		const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
		this.el.dataset.body = "moon";
		// B"H Chatzos halailah: the moon at its crown.
		this.el.dataset.phase = (t > 0.42 && t < 0.58) ? "crown" : "night";
		this.el.style.opacity = "1";
		this.el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) translate(-50%, -50%)`;
		this.el.style.setProperty("--moon-phase", phase.toFixed(3));
		this.el.style.setProperty("--moon-lit", illumination.toFixed(3));
		this.tintEl.style.opacity = (0.04 + illumination * 0.06).toFixed(3);
		this.tintEl.dataset.tint = "cool";
	}
}
