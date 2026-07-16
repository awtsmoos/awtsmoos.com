//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyTestTickets.mjs
 * @description Issues strict same-origin tickets and verified test socket identity.
 * The Awtsmoos renews credential and traveler without confusing either;
 * Awtsmoos.com proves the production boundary through one private test account.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
	issueGameTicket
} = require('../../../../api/ohr-hagnuz/auth/GameTicketStore.js');

export const TEST_ACCOUNT_ID = 'browser-test-account';
const OPEN_SOCKET_STATE = 1;

export function serveTestTicket(url, response, ticketCounts) {
	const slot = safeSlot(url.searchParams.get('slot'));
	if (!slot) {
		json(response, 400, {
			error: 'invalid_character_slot',
			ok: false
		});
		return;
	}
	const issued = issueGameTicket({
		accountId: TEST_ACCOUNT_ID,
		origin: url.origin,
		protocolVersion: 1,
		slot
	});
	ticketCounts.set(slot, (ticketCounts.get(slot) || 0) + 1);
	json(response, 200, {
		expiresAt: issued.expiresAt,
		ok: true,
		protocolVersion: 1,
		slot,
		ticket: issued.token
	});
}

export function createVerifiedTestClient(socket) {
	return {
		identity: Object.freeze({
			accountId: TEST_ACCOUNT_ID,
			assurance: 'verified'
		}),
		send(message) {
			if (socket.readyState === OPEN_SOCKET_STATE) {
				socket.send(JSON.stringify(message));
			}
		}
	};
}

function safeSlot(value) {
	const slot = String(value || '').toLowerCase();
	return /^[a-z0-9-]{1,32}$/.test(slot) ? slot : '';
}

function json(response, status, body) {
	response.writeHead(status, {
		'Cache-Control': 'no-store',
		'Content-Type': 'application/json; charset=utf-8'
	});
	response.end(JSON.stringify(body));
}
