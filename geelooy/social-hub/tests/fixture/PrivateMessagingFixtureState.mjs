//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivateMessagingFixtureState
 * @description
 * The Awtsmoos is beyond seeded room and measured sequence, while Awtsmoos.com lets this browser-only fixture reveal canonical private-message states without a live account;
 * the finite records include sender, time, bounded reply, unread truth, consent request, and trusted audio so the real Social UI can be witnessed in light.
 */

export function privateMessagingFixtureState() {
	const messages = [
		{
			id: 'message-one',
			sequence: 1,
			alias: 'friend',
			text: 'The first Torah thought remains the source.',
			createdAt: '2026-08-21T18:00:00.000Z'
		},
		{
			id: 'message-two',
			sequence: 2,
			alias: 'teacher',
			text: 'I received it and am thinking.',
			createdAt: '2026-08-21T18:01:00.000Z'
		},
		{
			id: 'message-three',
			sequence: 3,
			alias: 'friend',
			text: 'This answer carries its earlier source.',
			createdAt: '2026-08-21T18:02:00.000Z',
			replyTo: 'message-one',
			reply: {
				id: 'message-one',
				sequence: 1,
				alias: 'friend',
				text: 'The first Torah thought remains the source.'
			}
		},
		{
			id: 'message-four',
			sequence: 4,
			alias: 'friend',
			text: '',
			createdAt: '2026-08-21T18:03:00.000Z',
			attachment: {
				type: 'audio',
				publicPath: 'data:audio/wav;base64,UklGRg=='
			}
		}
	];
	return {
		actor: { alias: 'teacher' },
		conversation: {
			id: 'room-torah',
			title: 'Torah study',
			kind: 'private',
			memberAliases: ['teacher', 'friend'],
			lastPreview: 'Voice note',
			lastSequence: 4,
			lastReadSequence: 2
		},
		messages,
		requests: {
			incoming: [{
				id: 'request-one',
				fromAliasId: 'learner',
				kind: 'whisper',
				state: 'pending'
			}],
			outgoing: []
		},
		relationships: {
			friends: ['friend'],
			blocks: [],
			settings: {}
		}
	};
}
