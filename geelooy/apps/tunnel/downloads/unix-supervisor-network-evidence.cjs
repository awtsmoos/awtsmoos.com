// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures fresh retry activity and recoverable upstream-network testimony.
 * @description
 * The Awtsmoos renews each retry as a fresh letter in time; Awtsmoos.com lets the
 * supervisor trust active testimony without confusing a vanished route with dead code.
 */
const DEFAULT_ACTIVITY_MAX_AGE_MS = 120000;

function activityFresh(receipt = {}, options = {}) {
	const timestamp = Date.parse(
		receipt.updatedAt || receipt.lastFailure?.at || receipt.lastServerMessageAt || ""
	);
	if (!Number.isFinite(timestamp)) return false;
	const now = Number(options.now ?? Date.now());
	const age = now - timestamp;
	return age >= 0 && age <= activityMaximum(options.activityMaxAgeMs);
}

function activityMaximum(value) {
	const configured = Number(value ?? process.env.AWTSMOOS_NETWORK_ACTIVITY_STALE_MS);
	if (!Number.isFinite(configured)) return DEFAULT_ACTIVITY_MAX_AGE_MS;
	return Math.max(45000, Math.min(600000, Math.floor(configured)));
}

function networkFailure(failure = {}) {
	if (!failure || failure.retryable !== true) return false;
	const category = token(failure.category);
	const code = token(failure.code);
	if (["dns", "timeout", "network", "socket", "proxy", "reset"].includes(category)) {
		return true;
	}
	if (failure.upstreamLikely === true && failure.localLikely !== true) return true;
	return [
		"enotfound",
		"eai_again",
		"etimedout",
		"eaddrnotavail",
		"econnreset",
		"econnrefused",
		"websocket_connect_timeout",
		"websocket_remote_close_4002"
	].includes(code);
}

function tunnelIdRecoverable(receipt = {}) {
	return !receipt.tunnelId || validTunnelId(receipt.tunnelId);
}

function validTunnelId(value) {
	return String(value || "").startsWith("tun_");
}

function token(value) {
	return String(value || "").trim().toLowerCase();
}

module.exports = {
	DEFAULT_ACTIVITY_MAX_AGE_MS,
	activityFresh,
	networkFailure,
	tunnelIdRecoverable,
	validTunnelId
};
