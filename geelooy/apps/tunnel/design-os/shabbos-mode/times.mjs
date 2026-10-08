//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shabbos time calculation — pure functions, no external APIs.
 * @description Computes sunset via the NOAA solar-position algorithm, then derives
 * Friday candle lighting and Saturday havdalah for a given latitude/longitude.
 * All functions are pure (no imports) so the client script can embed them
 * verbatim via Function.prototype.toString().
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** Degrees to radians. */
export function deg2rad(d) { return d * DEG; }

/** Radians to degrees. */
export function rad2deg(r) { return r * RAD; }

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }

/**
 * Sunset time for a civil date and location (NOAA algorithm).
 * @param {number} y Full year (e.g. 2026)
 * @param {number} m Month 1-12
 * @param {number} d Day of month 1-31
 * @param {number} lat Latitude in degrees (-90..90)
 * @param {number} lon Longitude in degrees (-180..180)
 * @returns {number} Sunset as milliseconds since epoch (UTC). NaN at polar day/night.
 */
export function sunsetUTCms(y, m, d, lat, lon) {
	const jd = Date.UTC(y, m - 1, d) / 86400000 + 2440587.5; // Julian day at 0h UTC
	const jc = (jd - 2451545.0) / 36525.0;

	const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
	const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
	const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
	const Mr = deg2rad(M);
	const L0r = deg2rad(L0);

	const C = Math.sin(Mr) * (1.914602 - jc * (0.004817 + 0.000014 * jc))
		+ Math.sin(2 * Mr) * (0.019993 - 0.000101 * jc)
		+ Math.sin(3 * Mr) * 0.000289;
	const trueLong = L0 + C;
	const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(deg2rad(125.04 - 1934.136 * jc));
	const appLongR = deg2rad(appLong);

	const meanObliq = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60;
	const obliqCorr = meanObliq + 0.00256 * Math.cos(deg2rad(125.04 - 1934.136 * jc));
	const obliqR = deg2rad(obliqCorr);

	const decl = Math.asin(Math.sin(obliqR) * Math.sin(appLongR));

	const yv = Math.tan(obliqR / 2) * Math.tan(obliqR / 2);
	const eqTime = 4 * rad2deg(
		yv * Math.sin(2 * L0r)
		- 2 * e * Math.sin(Mr)
		+ 4 * e * yv * Math.sin(Mr) * Math.cos(2 * L0r)
		- 0.5 * yv * yv * Math.sin(4 * L0r)
		- 1.25 * e * e * Math.sin(2 * Mr)
	); // minutes

	const latR = deg2rad(lat);
	const cosH = clamp(
		Math.cos(deg2rad(90.833)) / (Math.cos(latR) * Math.cos(decl)) - Math.tan(latR) * Math.tan(decl),
		-1, 1
	);
	const ha = rad2deg(Math.acos(cosH)); // hour angle, degrees

	const solarNoonUTCmin = 720 - 4 * lon - eqTime; // minutes after 00:00 UTC
	const sunsetUTCmin = solarNoonUTCmin + ha * 4;
	return Date.UTC(y, m - 1, d) + sunsetUTCmin * 60000;
}

/**
 * Shabbos window for the week containing `now`.
 * @param {object} o
 * @param {number} o.lat Latitude degrees
 * @param {number} o.lon Longitude degrees
 * @param {Date} [o.now=new Date()] Reference moment
 * @param {number} o.utcOffsetMin Local UTC offset in minutes (e.g. 180 for UTC+3)
 * @param {number} [o.candleLightingMin=18] Minutes before Friday sunset
 * @param {number} [o.havdalahMin=50] Minutes after Saturday sunset
 * @returns {{candleLighting:Date,havdalah:Date,inShabbos:boolean,minutesToShabbos:number,minutesToHavdalah:number,fridaySunset:Date,saturdaySunset:Date}}
 */
export function getShabbosWindow(o) {
	const {
		lat, lon,
		now = new Date(),
		utcOffsetMin,
		candleLightingMin = 18,
		havdalahMin = 50,
	} = o;
	if (typeof lat !== "number" || typeof lon !== "number" || typeof utcOffsetMin !== "number") {
		throw new TypeError("getShabbosWindow requires numeric lat, lon, utcOffsetMin");
	}
	const nowMs = now.getTime();
	const localMs = nowMs + utcOffsetMin * 60000;
	const local = new Date(localMs);
	const weekday = local.getUTCDay(); // 0=Sun .. 6=Sat
	const daysSinceFriday = (weekday + 7 - 5) % 7;
	const friday = new Date(Date.UTC(
		local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceFriday
	));
	const fy = friday.getUTCFullYear(), fm = friday.getUTCMonth() + 1, fd = friday.getUTCDate();

	const friSunsetMs = sunsetUTCms(fy, fm, fd, lat, lon);
	const satDate = new Date(Date.UTC(fy, fm - 1, fd + 1));
	const satSunsetMs = sunsetUTCms(satDate.getUTCFullYear(), satDate.getUTCMonth() + 1, satDate.getUTCDate(), lat, lon);

	const candleLightingMs = friSunsetMs - candleLightingMin * 60000;
	const havdalahMs = satSunsetMs + havdalahMin * 60000;

	return {
		candleLighting: new Date(candleLightingMs),
		havdalah: new Date(havdalahMs),
		inShabbos: nowMs >= candleLightingMs && nowMs < havdalahMs,
		minutesToShabbos: (candleLightingMs - nowMs) / 60000,
		minutesToHavdalah: (havdalahMs - nowMs) / 60000,
		fridaySunset: new Date(friSunsetMs),
		saturdaySunset: new Date(satSunsetMs),
	};
}
