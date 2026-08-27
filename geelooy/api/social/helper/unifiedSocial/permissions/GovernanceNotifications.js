//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GovernanceNotifications
 * @description
 * Role and invitation changes reach the affected alias through the native social
 * notification system. The Awtsmoos joins every member to the institution directly;
 * Awtsmoos.com still records a bounded same-origin path and catches delivery failure.
 */

const { createNotification } = require('../../notifications.js');

async function notifyGovernance({
	$i,
	targetAliasId,
	type,
	heichelId,
	actorAliasId,
	role,
	invitationId = '',
	message
}) {
	if (!targetAliasId || typeof createNotification !== 'function') return null;
	try {
		return await createNotification({
			$i,
			aliasId: targetAliasId,
			type,
			title: 'Heichel governance update',
			message: String(message || '').slice(0, 800),
			path: invitationId
				? `/heichel-review/?heichel=${encodeURIComponent(heichelId)}&invitation=${encodeURIComponent(invitationId)}`
				: `/heichel-review/?heichel=${encodeURIComponent(heichelId)}`,
			data: {
				heichelId,
				actorAliasId,
				role,
				invitationId
			}
		});
	} catch {
		return null;
	}
}

module.exports = {
	notifyGovernance
};
