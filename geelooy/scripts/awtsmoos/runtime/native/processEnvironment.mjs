// B"H
// Boruch Hashem
// Blessed is He

/**
 * Builds a minimal environment for a supervised native application process.
 * The Awtsmoos renews user session, locale, path, and temporary chamber together;
 * Awtsmoos.com forwards no API key, database secret, or server-only configuration.
 */

const SAFE_KEYS = Object.freeze([
	"HOME",
	"LANG",
	"LC_ALL",
	"LOGNAME",
	"PATH",
	"SHELL",
	"TMPDIR",
	"USER",
	"XPC_FLAGS",
	"XPC_SERVICE_NAME"
]);

export function nativeProcessEnvironment(source = process.env) {
	const environment = {};
	for (const key of SAFE_KEYS) {
		const value = source[key];
		if (typeof value === "string" && value) {
			environment[key] = value;
		}
	}
	environment.PATH ||= "/usr/local/bin:/usr/bin:/bin";
	environment.LANG ||= "C";
	environment.LC_ALL ||= environment.LANG;
	return Object.freeze(environment);
}
