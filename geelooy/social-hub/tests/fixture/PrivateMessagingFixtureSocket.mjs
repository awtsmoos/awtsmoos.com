//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivateMessagingFixtureSocket
 * @description
 * The Awtsmoos is beyond request and response, while Awtsmoos.com lets this browser-only Netzach vessel answer the exact private-messaging event names production sends;
 * DETAILS, HISTORY, SEND, READ, and consent resolution mutate one evented fixture store so the real Social gateway walks an honest protocol-shaped path in light.
 */

export function createPrivateMessagingFixtureSocket(seed, store) {
	let nextSequence = Number(seed.conversation.lastSequence || 0) + 1;
	return {
		async request(type, payload = {}) {
			switch (type) {
				case 'private-messaging.conversation.get':
					return { payload: { conversation: seed.conversation } };
				case 'private-messaging.history':
					return history(payload);
				case 'private-messaging.message.send':
					return send(payload);
				case 'private-messaging.read':
					return read(payload);
				case 'private-messaging.request.resolve':
					return resolve(payload);
				default:
					return { payload: {} };
			}
		}
	};

	function history(payload) {
		const current = store.messages.get(String(payload.conversationId)) || seed.messages;
		const before = Number(payload.beforeSequence || 0);
		const messages = before
			? current.filter(message => Number(message.sequence) < before)
			: current;
		return { payload: { messages } };
	}

	function send(payload) {
		const source = findReply(payload);
		const message = {
			id: `fixture-message-${nextSequence}`,
			sequence: nextSequence,
			alias: seed.actor.alias,
			text: String(payload.text || ''),
			createdAt: new Date().toISOString()
		};
		if (source) {
			message.replyTo = source.id;
			message.reply = boundedReply(source);
		}
		if (payload.attachment?.assetId) {
			message.attachment = {
				type: 'audio',
				assetId: payload.attachment.assetId,
				publicPath: 'data:audio/wav;base64,UklGRg=='
			};
		}
		nextSequence += 1;
		store.appendMessage(payload.conversationId, message);
		seed.conversation.lastSequence = message.sequence;
		seed.conversation.lastPreview = message.text || 'Voice note';
		store.changed('conversations', seed.conversation.id);
		return { payload: { message } };
	}

	function read(payload) {
		seed.conversation.lastReadSequence = Math.max(
			Number(seed.conversation.lastReadSequence || 0),
			Number(payload.lastReadSequence || 0)
		);
		store.changed('conversations', seed.conversation.id);
		return { payload: { lastReadSequence: seed.conversation.lastReadSequence } };
	}

	function resolve(payload) {
		store.requests.incoming = store.requests.incoming.map(request => {
			return request.id === payload.requestId
				? { ...request, state: payload.resolution }
				: request;
		});
		store.changed('requests');
		return { payload: { requestId: payload.requestId, state: payload.resolution } };
	}

	function findReply(payload) {
		if (!payload.replyTo || !Number(payload.replySequence)) return null;
		const current = store.messages.get(String(payload.conversationId)) || seed.messages;
		return current.find(message => {
			return message.id === payload.replyTo
				&& Number(message.sequence) === Number(payload.replySequence);
		}) || null;
	}

	function boundedReply(message) {
		return {
			id: message.id,
			sequence: message.sequence,
			alias: message.alias,
			text: String(message.text || '').slice(0, 180)
		};
	}
}
