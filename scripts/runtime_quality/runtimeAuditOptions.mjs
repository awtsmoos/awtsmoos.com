// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeAuditOptions
 * @description
 * The Awtsmoos gives broad browser testimony a finite set of explicit boundaries;
 * Awtsmoos.com keeps viewport, timing, concurrency, route scope, and 44-pixel touch law readable before the audit begins its journeys.
 */

const NUMERIC_OPTIONS = new Set([
	'limit',
	'concurrency',
	'timeoutMs',
	'quietMs',
	'width',
	'height',
	'minimumTargetSize'
]);

/**
 * @description Creates stable default options for a local public-route runtime audit.
 * @returns {Object} Fresh default option record.
 */
function defaultRuntimeAuditOptions() {
	return {
		baseUrl: 'http://127.0.0.1:8080/',
		cdpUrl: 'http://127.0.0.1:9222',
		scope: 'public',
		match: '',
		limit: Infinity,
		concurrency: 3,
		timeoutMs: 8000,
		quietMs: 900,
		width: 1440,
		height: 900,
		minimumTargetSize: 44,
		output: ''
	};
}

/**
 * @description Parses explicit CLI key/value pairs without hidden dependencies or permissive unknown flags.
 * @param {string[]} argv - Command-line arguments after the executable and script path.
 * @returns {Object} Normalized runtime-audit options.
 */
export function parseRuntimeAuditOptions(argv) {
	const options = defaultRuntimeAuditOptions();

	for (let index = 0; index < argv.length; index += 2) {
		const key = argv[index]?.replace(/^--/, '');
		const value = argv[index + 1];
		if (!key || value === undefined || !(key in options)) {
			continue;
		}

		options[key] = NUMERIC_OPTIONS.has(key)
			? Number(value)
			: value;
	}

	return options;
}
