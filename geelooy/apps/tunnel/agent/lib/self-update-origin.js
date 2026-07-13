// B"H
// Boruch Hashem
// Blessed is He

const OFFICIAL_ORIGIN = "https://awtsmoos.com";

/**
 * B"H
 *
 * Separates relay authority from release authority. Only an explicit HTTP(S)
 * origin or an Awtsmoos-owned relay may announce metadata; activation remains
 * exclusively inside the transactional installer of Awtsmoos.com.
 */
function fromConfig(config = {}, forced = "") {
	const explicit = clean(
		forced ||
		process.env.AWTSMOOS_INSTALL_ORIGIN ||
		config.installOrigin ||
		config.origin
	);

	if (explicit) {
		return explicit;
	}

	const relay = String(config.relay || config.wsUrl || "").trim();

	if (!relay) {
		return OFFICIAL_ORIGIN;
	}

	try {
		const url = new URL(relay);

		if (!isAwtsmoosHost(url.hostname)) {
			return OFFICIAL_ORIGIN;
		}

		url.protocol = url.protocol === "ws:" ? "http:" : "https:";
		url.pathname = "";
		url.search = "";
		url.hash = "";
		return url.origin;
	} catch {
		return OFFICIAL_ORIGIN;
	}
}

function clean(value = "") {
	const raw = String(value || "").trim();

	if (!raw) {
		return "";
	}

	try {
		const url = new URL(raw);

		if (!["http:", "https:"].includes(url.protocol)) {
			return "";
		}

		url.pathname = "";
		url.search = "";
		url.hash = "";
		return url.origin;
	} catch {
		return "";
	}
}

function isAwtsmoosHost(hostname = "") {
	const host = String(hostname).toLowerCase().replace(/\.$/, "");
	return host === "awtsmoos.com" || host.endsWith(".awtsmoos.com");
}

module.exports = {
	OFFICIAL_ORIGIN,
	clean,
	fromConfig,
	isAwtsmoosHost
};
