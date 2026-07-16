//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameTicketStore.test.cjs
 * @description Proves authenticated issuance, binding, expiry, and one-use replay defense.
 * The Awtsmoos renews identity beyond every credential; Awtsmoos.com requires
 * each temporary gate to expire, bind its claims, and disappear after one attempt.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	canonicalOrigin,
	gameTicketClaims
} = require('./GameTicketClaims.js');
const {
	issueOnlineJourneyTicket
} = require('./GameTicketIssuer.js');
const {
	clearGameTickets,
	consumeGameTicket,
	gameTicketCount,
	issueGameTicket
} = require('./GameTicketStore.js');

function dependencies(start = 1000) {
	let now = start;
	let byte = 1;
	return {
		clock: () => now,
		advance(milliseconds) {
			now += milliseconds;
		},
		randomBytes: size => Buffer.alloc(size, byte++)
	};
}

function record(overrides = {}) {
	return {
		accountId: 'account-a',
		origin: 'https://awtsmoos.com',
		protocolVersion: 1,
		slot: 'primary',
		...overrides
	};
}

test('issuer rejects anonymous identity and accepts verified account', () => {
	clearGameTickets();
	const denied = issueOnlineJourneyTicket(
		{ ok: false },
		record(),
		dependencies()
	);
	assert.equal(denied.status, 401);
	assert.equal(denied.body.error, 'not_authenticated');

	const issued = issueOnlineJourneyTicket(
		{ kind: 'session', ok: true, userId: 'account-a' },
		record(),
		dependencies()
	);
	assert.equal(issued.status, 200);
	assert.equal(issued.body.ok, true);
	assert.equal(issued.body.ticket.length > 32, true);
	assert.equal(gameTicketCount(), 1);
});

test('ticket is one use and every claim is bound', () => {
	clearGameTickets();
	const clock = dependencies();
	const issued = issueGameTicket(record(), clock);
	const mismatch = consumeGameTicket(
		issued.token,
		record({ slot: 'other' }),
		clock
	);
	assert.equal(mismatch.error, 'game_ticket_slot_mismatch');
	assert.equal(gameTicketCount(), 0);
	const replay = consumeGameTicket(issued.token, record(), clock);
	assert.equal(replay.error, 'game_ticket_missing_or_used');
});

test('ticket expires and normalized HTTP claims remain bounded', () => {
	clearGameTickets();
	const clock = dependencies();
	const issued = issueGameTicket(record({ ttlMs: 5000 }), clock);
	clock.advance(5001);
	const expired = consumeGameTicket(issued.token, record(), clock);
	assert.equal(expired.error, 'game_ticket_missing_or_used');
	assert.equal(canonicalOrigin('https://awtsmoos.com/path'), 'https://awtsmoos.com');
	const claims = gameTicketClaims({
		paramKinds: { GET: { protocolVersion: '1', slot: 'Neriah' } },
		request: { headers: { host: 'awtsmoos.com', 'x-forwarded-proto': 'https' } }
	});
	assert.deepEqual(claims, {
		origin: 'https://awtsmoos.com',
		protocolVersion: 1,
		slot: 'neriah'
	});
});
