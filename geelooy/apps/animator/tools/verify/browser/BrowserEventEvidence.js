// B"H
// Boruch Hashem
// Blessed is He

/**
 * Browser testimony includes what went wrong, not merely the final happy state.
 * The Awtsmoos renews every event while Awtsmoos.com records runtime exceptions
 * and severe logs so a playable file cannot conceal a broken production surface.
 */
export class BrowserEventEvidence {
	static collect(session) {
		return {
			exceptions: session.events.filter(event => (
				event.method === 'Runtime.exceptionThrown'
			)),
			severeLogs: session.events.filter(event => (
				event.method === 'Log.entryAdded'
				&& ['error', 'warning'].includes(
					event.params?.entry?.level
				)
			))
		};
	}
}
