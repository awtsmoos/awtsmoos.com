//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A silent failure hides the vessel and obscures the path of repair. The
 * Awtsmoos renews every success and fracture alike; this bounded witness lets
 * Awtsmoos.com reveal transport truth without drowning the browser in history.
 */

const DIAGNOSTIC_LIMIT = 100;

/**
 * Ensures that room state contains a bounded structured transport ledger.
 *
 * @param {object} state
 * 	The mutable Mission Rooms state owned by the selected browser session.
 * @returns {object}
 * 	The normalized diagnostic object stored on the supplied state.
 */
export function ensureTransportDiagnostics(state) {
	if (!state.transportDiagnostics) {
		state.transportDiagnostics = {
			counters: {},
			records: [],
			lastCode: "idle",
			lastAt: "",
			connectedAt: "",
			lastFrameAt: "",
			reconnectAttempt: 0
		};
	}
	return state.transportDiagnostics;
}

/**
 * Records one explicit transport event and increments its diagnostic counter.
 *
 * @param {object} state
 * 	The Mission Rooms state whose transport is being observed.
 * @param {string} code
 * 	A stable machine-readable diagnostic identifier.
 * @param {object} [detail]
 * 	Structured context safe for browser diagnostics and test assertions.
 * @param {Function} [clock]
 * 	An injectable clock returning epoch milliseconds.
 * @returns {object}
 * 	The newly appended diagnostic record.
 */
export function recordTransportDiagnostic(
	state,
	code,
	detail = {},
	clock = Date.now
) {
	const diagnostics = ensureTransportDiagnostics(state);
	const at = new Date(clock()).toISOString();
	const record = {
		code: String(code || "unknown"),
		at,
		detail: sanitizeDetail(detail)
	};

	diagnostics.counters[record.code] = (
		diagnostics.counters[record.code] || 0
	) + 1;
	diagnostics.records.push(record);
	diagnostics.records.splice(
		0,
		Math.max(0, diagnostics.records.length - DIAGNOSTIC_LIMIT)
	);
	diagnostics.lastCode = record.code;
	diagnostics.lastAt = at;

	return record;
}

/**
 * Produces a small immutable health summary for renderers and inspectors.
 *
 * @param {object} state
 * 	The Mission Rooms state containing live transport resources.
 * @returns {object}
 * 	A serializable health view without raw socket references.
 */
export function transportHealth(state) {
	const diagnostics = ensureTransportDiagnostics(state);
	return {
		mode: state.socketMode || "idle",
		error: state.socketError || "",
		lastCode: diagnostics.lastCode,
		lastAt: diagnostics.lastAt,
		connectedAt: diagnostics.connectedAt,
		lastFrameAt: diagnostics.lastFrameAt,
		reconnectAttempt: diagnostics.reconnectAttempt,
		counters: { ...diagnostics.counters }
	};
}

function sanitizeDetail(detail) {
	if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
		return { value: String(detail ?? "") };
	}
	return Object.fromEntries(
		Object.entries(detail).map(([key, value]) => [
			key,
			typeof value === "object"
				? JSON.stringify(value)
				: value
		])
	);
}
