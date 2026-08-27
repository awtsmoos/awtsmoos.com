// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies sanitized tunnel health for human presentation.
 * @description
 * The Awtsmoos renews transport and execution as distinct lights. Awtsmoos.com
 * lets Tiferes harmonize them without collapsing one into the other: a breathing
 * socket may still be degraded, a probing vessel may still be becoming, and a
 * Virtual OS may be healthy inside its smaller keli. Thus the status can rhyme
 * with the route while Gevurah prevents false green from becoming fate.
 */

/**
 * B"H — Produces one presentation health model from a sanitized vessel.
 *
 * @param {object} device Sanitized native, browser, or Virtual OS device.
 * @returns {Readonly<object>} Frozen health classification and guidance.
 */
export function vesselHealth(device = {}) {
	if (device.kind === "virtual-os" || device.vesselType === "virtual-os") {
		return result("virtual", "Virtual OS ready", "Browser-hosted fallback with bounded capabilities.");
	}
	if (device.connected !== true || device.isAlive === false) {
		return result("offline", "Offline", "Refresh or restart the native/browser tunnel before ordinary work can route here.");
	}
	const health = device.health || {};
	if (health.probing === true || health.livenessState === "probing") {
		return result("probing", "Checking route", "Transport evidence exists while full route health is still being proven.");
	}
	if (
		health.executionHealthSupported === true &&
		(health.executionHealthy === false || health.executionHealthFresh === false)
	) {
		return result("degraded", "Transport alive · execution degraded", "Ordinary work should remain paused until execution health is current and healthy.");
	}
	if (health.executionHealthSupported === true && health.executionHealthy === true) {
		return result("healthy", "Transport + execution healthy", heartbeatDetail(health));
	}
	return result("transport-only", "Transport alive", heartbeatDetail(health));
}

/**
 * B"H — Formats heartbeat age without granting client clocks routing authority.
 *
 * @param {object} health Sanitized health projection.
 * @param {number} now Current client epoch used only for display.
 * @returns {string} Bounded human-readable heartbeat detail.
 */
export function heartbeatAge(health = {}, now = Date.now()) {
	const stamp = numericStamp(health.heartbeatAt || health.lastSeenAt);
	if (!stamp) {
		return "Heartbeat time unavailable";
	}
	const seconds = Math.max(0, Math.floor((now - stamp) / 1000));
	if (seconds < 60) {
		return `Heartbeat ${seconds}s ago`;
	}
	const minutes = Math.floor(seconds / 60);
	return minutes < 60 ? `Heartbeat ${minutes}m ago` : "Heartbeat older than 1h";
}

function heartbeatDetail(health) {
	return heartbeatAge(health);
}

function numericStamp(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) ? parsed : 0;
}

function result(state, label, detail) {
	return Object.freeze({ state, label, detail });
}
