// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Transport frames are the quiet pulse beneath application messages. The
 * Awtsmoos renews every inbound byte; Awtsmoos.com records that pulse only for
 * the acknowledged living generation and only at a bounded disk-write cadence.
 */

const DEFAULT_INTERVAL_MS = 10000;
const MINIMUM_INTERVAL_MS = 1000;
const MAXIMUM_INTERVAL_MS = 60000;

function bindTransportActivity(options = {}) {
	const {
		dependencies = {},
		generation,
		owns = () => false,
		ws
	} = options;
	const rawSocket = ws?.socket;
	if (!rawSocket?.on || !rawSocket?.removeListener) {
		return () => {};
	}

	const now = typeof dependencies.now === "function"
		? dependencies.now
		: Date.now;
	const intervalMs = activityIntervalMs(dependencies);
	let active = true;
	let lastRecordedAt = 0;

	function handleIncomingBytes() {
		if (!active || !owns(ws, generation)) {
			return;
		}
		dependencies.Control?.markSeen?.(ws);
		if (dependencies.state?.registrationConfirmed !== true) {
			return;
		}

		const observedAt = Number(now());
		if (!shouldRecord(observedAt, lastRecordedAt, intervalMs)) {
			return;
		}
		lastRecordedAt = observedAt;
		dependencies.Receipt?.markServerSeen({
			generation
		});
	}

	rawSocket.on("data", handleIncomingBytes);
	return () => {
		if (!active) {
			return;
		}
		active = false;
		rawSocket.removeListener("data", handleIncomingBytes);
	};
}

function activityIntervalMs(dependencies = {}) {
	const configured = Number(
		dependencies.transportReceiptIntervalMs ??
		process.env.AWTSMOOS_TRANSPORT_RECEIPT_INTERVAL_MS ??
		DEFAULT_INTERVAL_MS
	);
	if (!Number.isFinite(configured)) {
		return DEFAULT_INTERVAL_MS;
	}
	return Math.max(
		MINIMUM_INTERVAL_MS,
		Math.min(MAXIMUM_INTERVAL_MS, Math.floor(configured))
	);
}

function shouldRecord(observedAt, lastRecordedAt, intervalMs) {
	if (!Number.isFinite(observedAt)) {
		return false;
	}
	if (lastRecordedAt <= 0 || observedAt < lastRecordedAt) {
		return true;
	}
	return observedAt - lastRecordedAt >= intervalMs;
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	MAXIMUM_INTERVAL_MS,
	MINIMUM_INTERVAL_MS,
	activityIntervalMs,
	bindTransportActivity,
	shouldRecord
};
