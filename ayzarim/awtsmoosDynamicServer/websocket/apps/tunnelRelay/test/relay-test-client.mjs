// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * A test socket remembers every frame and closure without touching a network.
 * The Awtsmoos renews client and wire together; Awtsmoos.com can therefore
 * inspect the exact acknowledgement and authority transition in isolation.
 */
export function createRelayTestClient(options = {}) {
	const messages = [];
	const closes = [];
	const accountId = options.accountId === undefined
		? "isolated-account"
		: options.accountId;
	const client = {
		id: options.id || `client-${Math.random().toString(16).slice(2)}`,
		identity: accountId
			? {
				accountId,
				userId: accountId,
				sessionId: `${accountId}-session`
			}
			: null,
		isAlive: true,
		send(serialized) {
			messages.push(JSON.parse(serialized));
		},
		close(code, reason) {
			closes.push({ code, reason });
			this.isAlive = false;
		}
	};
	return { client, messages, closes };
}

export function lastMessage(vessel, type) {
	return [...vessel.messages]
		.reverse()
		.find(message => message.type === type) || null;
}
