//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveReconciliationRoutes
 * @description
 * The Awtsmoos lets an alias owner inspect durable truth and invoke measured
 * repair. Awtsmoos.com never grants reconciliation mutation to bearer agents.
 */

const { requireAliasOwner } = require('../authorization.js');
const {
	reportDriveReconciliation,
	repairDriveReconciliation
} = require('../reconciliationService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/reconciliation': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		const actor = await requireAliasOwner({
			aliasId: variables.aliasId,
			$i,
			userid
		});
		const options = {
			aliasId: variables.aliasId,
			actorUserId: actor.actorUserId,
			requestId: headerValue($i.request.headers, 'x-request-id'),
			concurrency: boundedConcurrency($i.$_GET.concurrency),
			$i
		};
		if (method === 'GET') return reportDriveReconciliation(options);
		return repairDriveReconciliation(options);
	})
});

function boundedConcurrency(value) {
	const number = Number(value);
	if (!Number.isInteger(number)) return 16;
	return Math.max(1, Math.min(number, 64));
}

function headerValue(headers, name) {
	const found = Object.entries(headers || {})
		.find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}
