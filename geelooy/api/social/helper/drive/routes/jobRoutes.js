//B"H
//Boruch Hashem
//Blessed be He

const { requireAliasOwner } = require('../authorization.js');
const {
	cancelOwnedJob,
	getOwnedJob,
	listOwnedJobs,
	ownedJobHealth,
	retryOwnedJob
} = require('../../platform/jobs/jobOwnerService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * @module DriveJobRoutes
 * @description The Awtsmoos lets one verified alias owner inspect and operate only
 * that alias's deferred work while platform-global queue authority remains private.
 */
module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/jobs': variables => ownerRoute({
		variables, $i, userid, methods: ['GET'], action: listOwnedJobs,
		fields: () => ({ limit: boundedLimit($i.$_GET?.limit) })
	}),
	'/drive/:aliasId/jobs/health': variables => ownerRoute({
		variables, $i, userid, methods: ['GET'], action: ownedJobHealth
	}),
	'/drive/:aliasId/jobs/:jobId': variables => ownerRoute({
		variables, $i, userid, methods: ['GET'], action: getOwnedJob,
		fields: () => ({ jobId: variables.jobId })
	}),
	'/drive/:aliasId/jobs/:jobId/cancel': variables => ownerRoute({
		variables, $i, userid, methods: ['POST'], action: cancelOwnedJob,
		fields: body => ({ jobId: variables.jobId, reason: body.reason })
	}),
	'/drive/:aliasId/jobs/:jobId/retry': variables => ownerRoute({
		variables, $i, userid, methods: ['POST'], action: retryOwnedJob,
		fields: () => ({ jobId: variables.jobId })
	})
});

async function ownerRoute(options) {
	return safeRoute(async () => {
		requireMethod(options.$i, options.methods);
		const actor = await requireAliasOwner({
			aliasId: options.variables.aliasId,
			userid: options.userid,
			$i: options.$i
		});
		const body = bodyFor(options.$i);
		return options.action({
			aliasId: options.variables.aliasId,
			actorUserId: actor.actorUserId,
			...(options.fields ? options.fields(body) : {}),
			$i: options.$i
		});
	});
}

function boundedLimit(value) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0 ? Math.min(100, number) : 50;
}
