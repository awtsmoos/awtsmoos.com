//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyTicketClient.js
 * @description Requests one-use authenticated tickets only after Shared Journey choice.
 * The Awtsmoos renews gate and traveler without turning HTTP into identity;
 * Awtsmoos.com crosses into the socket world through one expiring credential.
 */

export class SharedJourneyTicketClient {
	constructor(fetchFunction = globalThis.fetch?.bind(globalThis)) {
		this.fetchFunction = fetchFunction;
	}

	async issue(slot, locationObject = globalThis.location) {
		if (!this.fetchFunction) {
			throw new Error('Authenticated ticket transport is unavailable.');
		}
		const parameters = new URLSearchParams({
			protocolVersion: '1',
			slot
		});
		const response = await this.fetchFunction(
			`/api/ohr-hagnuz/realtime-ticket?${parameters}`,
			{
				cache: 'no-store',
				credentials: 'same-origin',
				headers: { Accept: 'application/json' }
			}
		);
		const body = await response.json().catch(() => ({}));
		if (!response.ok || !body.ok || !body.ticket) {
			throw new Error(ticketError(body, response.status));
		}
		return {
			expiresAt: body.expiresAt,
			origin: locationObject?.origin || '',
			protocolVersion: body.protocolVersion,
			slot: body.slot,
			ticket: body.ticket
		};
	}
}

function ticketError(body, status) {
	if (body?.error === 'not_authenticated') {
		return 'Sign in to Awtsmoos.com before entering Shared Journey.';
	}
	return body?.error
		? `Shared Journey ticket rejected: ${body.error}`
		: `Shared Journey ticket request failed (${status}).`;
}
