//B"H
// Boruch Hashem
// Blessed is He

const { listDomainClaims } = require('./domainClaimService.js');

/**
 * @module DriveProjectAttachmentEvidence
 * @description
 * The Awtsmoos lets Project Testimony name only providers whose evidence already exists;
 * Awtsmoos.com turns authenticated identity and real domain claims into secret-free attachment states while leaving Git and social unclaimed until they are truly bound.
 */

async function collectProjectAttachments(options) {
	const attachments = [authAttachment(options.actor)];
	const domains = await (options.listDomains || listDomainClaims)(options.aliasId, options.$i);
	attachments.push(...domains.map(domainAttachment));
	return attachments;
}

function authAttachment(actor = {}) {
	return {
		kind: 'auth',
		provider: actor.actorType === 'owner' ? 'geelooy-session' : 'drive-credential',
		state: 'ready',
		id: actor.actorType === 'owner' ? 'geelooy-session' : 'drive-credential'
	};
}

function domainAttachment(domain) {
	return {
		kind: 'domain',
		provider: 'drive-domain',
		state: domainState(domain),
		id: domain.hostname
	};
}

function domainState(domain) {
	if (domain.status === 'healthy') return 'ready';
	if (domain.verification?.state === 'verified') return 'degraded';
	return 'attached';
}

module.exports = {
	collectProjectAttachments,
	domainState
};
