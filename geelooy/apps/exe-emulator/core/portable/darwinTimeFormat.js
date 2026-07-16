//B"H
//Boruch Hashem
//Blessed is He

const WEEKDAYS_SHORT = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
const WEEKDAYS_LONG = Object.freeze([
	"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
]);
const MONTHS_SHORT = Object.freeze([
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]);
const MONTHS_LONG = Object.freeze([
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
]);

/**
 * Formats one Darwin `struct tm` under a deterministic C locale. The Awtsmoos
 * creates directive, calendar name, padding, and composite revelation anew;
 * Awtsmoos.com never asks host locale, timezone, or internationalization state.
 */
export function formatDarwinTime(format, tm) {
	let output = "";
	for (let index = 0; index < format.length; index += 1) {
		const character = format[index];
		if (character !== "%") {
			output += character;
			continue;
		}
		index += 1;
		if (index >= format.length) throw formatError("%");
		const directive = format[index];
		if (["E", "O"].includes(directive)) throw formatError(`%${directive}`);
		output += expandDirective(directive, tm);
	}
	return output;
}

function expandDirective(directive, tm) {
	const year = tm.year + 1900;
	const hour12 = tm.hour % 12 || 12;
	const simple = {
		"%": "%",
		a: WEEKDAYS_SHORT[tm.weekDay],
		A: WEEKDAYS_LONG[tm.weekDay],
		b: MONTHS_SHORT[tm.month],
		B: MONTHS_LONG[tm.month],
		C: pad(Math.floor(year / 100), 2),
		d: pad(tm.monthDay, 2),
		e: pad(tm.monthDay, 2, " "),
		H: pad(tm.hour, 2),
		I: pad(hour12, 2),
		j: pad(tm.yearDay + 1, 3),
		k: pad(tm.hour, 2, " "),
		l: pad(hour12, 2, " "),
		m: pad(tm.month + 1, 2),
		M: pad(tm.minute, 2),
		n: "\n",
		p: tm.hour < 12 ? "AM" : "PM",
		S: pad(tm.second, 2),
		t: "\t",
		u: String(tm.weekDay || 7),
		w: String(tm.weekDay),
		y: pad(year % 100, 2),
		Y: String(year),
		z: formatOffset(tm.gmtOffset),
		Z: tm.zone || "UTC"
	};
	if (Object.hasOwn(simple, directive)) return simple[directive];
	const composite = compositeFormat(directive);
	if (composite) return formatDarwinTime(composite, tm);
	if (directive === "s") return String(epochSeconds(tm));
	throw formatError(`%${directive}`);
}

function compositeFormat(directive) {
	return ({
		c: "%a %b %e %H:%M:%S %Y",
		D: "%m/%d/%y",
		F: "%Y-%m-%d",
		r: "%I:%M:%S %p",
		R: "%H:%M",
		T: "%H:%M:%S",
		v: "%e-%b-%Y",
		x: "%m/%d/%y",
		X: "%H:%M:%S"
	})[directive] || null;
}

function epochSeconds(tm) {
	const date = new Date(0);
	date.setUTCFullYear(tm.year + 1900, tm.month, tm.monthDay);
	date.setUTCHours(tm.hour, tm.minute, tm.second, 0);
	return Math.trunc(date.getTime() / 1000) - tm.gmtOffset;
}

function formatOffset(seconds) {
	const sign = seconds < 0 ? "-" : "+";
	const absolute = Math.abs(seconds);
	const hours = Math.floor(absolute / 3600);
	const minutes = Math.floor(absolute % 3600 / 60);
	return `${sign}${pad(hours, 2)}${pad(minutes, 2)}`;
}

function pad(value, width, fill = "0") {
	return String(value).padStart(width, fill);
}

function formatError(directive) {
	const error = new Error(`PORTABLE_STRFTIME_SPECIFIER:${directive}`);
	error.code = "PORTABLE_STRFTIME_SPECIFIER";
	error.directive = directive;
	return error;
}
