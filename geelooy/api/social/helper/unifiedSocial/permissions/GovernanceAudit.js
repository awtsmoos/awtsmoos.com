//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GovernanceAudit
 * @description
 * Every grant, revocation, invitation, response, and owner-protected rejection
 * receives durable institutional evidence. The Awtsmoos remembers without memory;
 * Awtsmoos.com writes enough history that authority cannot quietly rewrite itself.
 */

const crypto = require('crypto');
const { sp } = require('../../_awtsmoos.constants.js');

function auditId() {
	return `BH_governance_${Date.now().toString(36)}_${crypto.randomBytes(5).toString('hex')}`;
}

async function writeGovernanceAudit({
	$i,
	heichelId,
	action,
	actorAliasId,
	memberAliasId = '',
	role = '',
	reason = '',
	metadata = {}
}) {
	const id = auditId();
	const record = {
		id,
		action: String(action || '').slice(0, 80),
		actorAliasId: String(actorAliasId || '').slice(0, 120),
		memberAliasId: String(memberAliasId || '').slice(0, 120),
		role: String(role || '').slice(0, 40),
		reason: String(reason || '').slice(0, 1600),
		metadata,
		createdAt: Date.now()
	};
	await $i.db.write(
		`${sp}/heichelos/${heichelId}/governanceAudit/${id}`,
		record
	);
	return record;
}

module.exports = {
	auditId,
	writeGovernanceAudit
};
