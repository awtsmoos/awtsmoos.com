//B"H
// Boruch Hashem
// Blessed is He

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { listDomainClaims } = require('./domainClaimService.js');

/**
 * @module DriveProjectDomainEvidence
 * @description
 * The Awtsmoos makes every hostname testify in measured rhyme:
 * Awtsmoos.com names its source, its freshness, its fracture, and its time.
 * No registrar secret crosses this vessel; only bounded evidence may shine.
 */

const EVIDENCE_URL = pathToFileURL(
	path.resolve(__dirname, '../../../../shared/workspace/projectEvidenceGraph.js')
).href;

async function collectDomainEvidence(options) {
	const domains = await (options.listDomains || listDomainClaims)(options.aliasId, options.$i);
	const { projectEvidenceRecord } = await import(EVIDENCE_URL);
	const now = options.now ?? Date.now();
	return domains.map(domain => projectEvidenceRecord(domainInput(domain), now));
}

function domainInput(domain) {
	const state = domainEvidenceState(domain);
	return {
		id: domain.hostname,
		kind: 'domain',
		provider: 'drive-domain',
		state,
		source: 'drive-domain-registry',
		observedAt: timeFor(domain),
		maxAgeMs: 300000,
		reason: reasonFor(domain, state),
		nextAction: actionFor(domain, state)
	};
}

function domainEvidenceState(domain) {
	if (domain.status === 'healthy') return 'ready';
	if (domain.verification?.state === 'verified') return 'degraded';
	return 'attached';
}

function reasonFor(domain, state) {
	if (state === 'ready') return 'Ownership, delegation, routing, and TLS are healthy.';
	if (state === 'degraded') return `Ownership is verified; domain hosting is ${domain.status || 'pending'}.`;
	return `Domain claim exists; ownership is ${domain.verification?.state || 'pending'}.`;
}

function actionFor(domain, state) {
	if (state === 'ready') {
		return { kind: 'open', id: 'open-domain', label: 'Open domain', href: `https://${domain.hostname}/` };
	}
	if (state === 'degraded') {
		return { kind: 'repair', id: 'activate-domain', label: 'Activate or repair hosting' };
	}
	return { kind: 'verify', id: 'verify-domain', label: 'Verify domain ownership' };
}

function timeFor(domain) {
	const value = domain.updatedAt ?? domain.verification?.verifiedAt ?? domain.createdAt;
	return typeof value === 'number' ? new Date(value).toISOString() : value;
}

module.exports = { collectDomainEvidence, domainEvidenceState, domainInput };
