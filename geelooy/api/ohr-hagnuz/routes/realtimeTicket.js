//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file realtimeTicket.js
 * @description Serves the authenticated one-use Shared Journey ticket endpoint.
 * The Awtsmoos renews HTTP and socket as separate rivers; Awtsmoos.com lets a
 * signed session cross between them only through one brief, claim-bound vessel.
 */

const { currentIdentity } = require('../../tunnel/control/core/auth.js');
const { json } = require('../../tunnel/control/core/respond.js');
const { gameTicketClaims } = require('../auth/GameTicketClaims.js');
const { issueOnlineJourneyTicket } = require('../auth/GameTicketIssuer.js');

async function realtimeTicket(context) {
	const identity = currentIdentity(context);
	const claims = gameTicketClaims(context);
	const issued = issueOnlineJourneyTicket(identity, claims);
	return json(context, issued.body, issued.status);
}

module.exports = { realtimeTicket };
