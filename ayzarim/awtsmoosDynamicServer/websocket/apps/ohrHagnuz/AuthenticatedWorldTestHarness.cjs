//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthenticatedWorldTestHarness.cjs
 * @description Drives verified identities through ticketed persistent road commands.
 * The Awtsmoos renews proof and traveler without confusing either; Awtsmoos.com
 * uses this test vessel to expose replay, persistence, and combat mistakes.
 */

const { RealtimePlatform } = require('../../platform/RealtimePlatform.js');
const { createOhrHagnuzApplication } = require('./application.js');
const { MemoryCharacterRepository } = require('./persistence/MemoryCharacterRepository.js');
const {
	clearGameTickets,
	issueGameTicket
} = require('../../../../../geelooy/api/ohr-hagnuz/auth/GameTicketStore.js');

class AuthenticatedWorldTestHarness {
	constructor() {
		this.now = 100000;
		this.repository = new MemoryCharacterRepository();
		this.server = {};
		this.platform = new RealtimePlatform(this.server, [() => (
			createOhrHagnuzApplication({
				dependencies: {
					clock: () => this.now,
					randomBytes: size => Buffer.alloc(size, this.now % 251)
				},
				repositoryProvider: () => this.repository
			})
		)]);
		this.sequenceByClient = new Map();
		clearGameTickets();
	}

	client(accountId) {
		return {
			identity: Object.freeze({ accountId, assurance: 'verified' }),
			messages: [],
			send(message) {
				this.messages.push(message);
			}
		};
	}

	ticket(accountId, slot) {
		return issueGameTicket({
			accountId,
			origin: 'https://awtsmoos.com',
			protocolVersion: 1,
			slot
		}, {
			clock: () => this.now,
			randomBytes: size => Buffer.alloc(
				size,
				(slot.length + this.now) % 251
			)
		});
	}

	async send(client, type, payload = {}) {
		const sequence = (this.sequenceByClient.get(client) || 0) + 1;
		this.sequenceByClient.set(client, sequence);
		await this.platform.route(client, JSON.stringify({
			application: 'ohr-hagnuz',
			payload,
			protocol: 'awtsmoos.realtime',
			requestId: `${type}-${sequence}`,
			sequence,
			type,
			version: 1
		}));
		return [...client.messages].reverse()
			.find(message => message.requestId === `${type}-${sequence}`);
	}

	async join(client, displayName, slot, token) {
		return this.send(client, 'journey.join', {
			displayName,
			glyph: displayName[0],
			origin: 'https://awtsmoos.com',
			slot,
			ticket: token
		});
	}

	async moveEast(client, firstSequence, steps) {
		for (let index = 0; index < steps; index += 1) {
			await this.send(client, 'journey.move', {
				dx: 1,
				dy: 0,
				movementSequence: firstSequence + index
			});
		}
	}

	async attack(client, attackSequence) {
		this.now += 130;
		return this.send(client, 'journey.attack', {
			attackSequence,
			targetId: 'veil-wisp'
		});
	}
}

module.exports = { AuthenticatedWorldTestHarness };
