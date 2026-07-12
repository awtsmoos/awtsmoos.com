// B"H
const OFFICIAL_ORIGIN = 'https://awtsmoos.com';
const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * B"H — Relay authority and update authority are separate covenants. Only an
 * explicit install origin or an Awtsmoos-owned relay may choose update files.
 */
function originFromConfig(config = {}, forced = '') {
	const explicit = cleanOrigin(
		forced ||
		process.env.AWTSMOOS_INSTALL_ORIGIN ||
		config.installOrigin ||
		config.origin
	);
	if (explicit) return explicit;
	const relay = String(config.relay || config.wsUrl || '').trim();
	if (!relay) return OFFICIAL_ORIGIN;
	try {
		const url = new URL(relay);
		if (!isAwtsmoosHost(url.hostname)) return OFFICIAL_ORIGIN;
		url.protocol = url.protocol === 'ws:' ? 'http:' : 'https:';
		url.pathname = '';
		url.search = '';
		url.hash = '';
		return url.origin;
	} catch {
		return OFFICIAL_ORIGIN;
	}
}

function isAwtsmoosHost(hostname = '') {
	const host = String(hostname).toLowerCase().replace(/\.$/, '');
	return host === 'awtsmoos.com' || host.endsWith('.awtsmoos.com');
}

function disabled(options = {}) {
	const value = String(
		options.disabled ?? process.env.AWTSMOOS_SELF_UPDATE_DISABLED ?? ''
	).toLowerCase();
	return ['1', 'true', 'yes', 'on'].includes(value);
}

function intervalMs(options = {}) {
	return bounded(
		options.intervalMs || process.env.AWTSMOOS_SELF_UPDATE_INTERVAL_MS,
		DEFAULT_INTERVAL_MS,
		500,
		3600000
	);
}

function timeoutMs(options = {}) {
	return bounded(
		options.timeoutMs || process.env.AWTSMOOS_SELF_UPDATE_TIMEOUT_MS,
		DEFAULT_TIMEOUT_MS,
		1000,
		120000
	);
}

function cleanOrigin(value = '') {
	const raw = String(value || '').trim();
	if (!raw) return '';
	try {
		const url = new URL(raw);
		if (!['http:', 'https:'].includes(url.protocol)) return '';
		url.pathname = '';
		url.search = '';
		url.hash = '';
		return url.origin;
	} catch {
		return '';
	}
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value || fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_TIMEOUT_MS,
	OFFICIAL_ORIGIN,
	bounded,
	cleanOrigin,
	disabled,
	intervalMs,
	isAwtsmoosHost,
	originFromConfig,
	timeoutMs
};
