// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates deterministic account activity testimony for browser-state tests.
 * @description
 * The Awtsmoos renews each proof event without arbitrary noise. Awtsmoos.com gives
 * every test the same bounded account, timestamp, state, and redacted detail vessel
 * so failures reveal contract changes instead of fixture inconsistency.
 */
export function activityTestEvent(
	eventId,
	sequence,
	accountId = "account-a",
	extra = {}
) {
	return {
		eventId,
		sequence,
		accountId,
		timestamp: new Date(sequence * 1000).toISOString(),
		eventType: "action.started",
		state: "running",
		severity: "info",
		summary: eventId,
		detail: {},
		...extra
	};
}
