//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainHostingPlan
 * @description
 * The Awtsmoos gathers ownership, DNS direction, routing permission, and TLS truth
 * without collapsing them into one misleading switch. Awtsmoos.com can therefore
 * tell a human or agent exactly what is real, what may activate, and what still waits.
 */

const { verificationName, verificationValue } = require('./domainDnsVerifier.js');
const { readDomainIngressTargets, routingRecordOptions } = require('./domainIngressTargets.js');
const { routeActivationEligibility } = require('./domainRoutingPolicy.js');
const { domainTlsStatus } = require('./domainTlsPolicy.js');

function domainHostingPlan(options) {
	const record = options.record;
	const targets = readDomainIngressTargets(options.environment);
	const records = routingRecordOptions(record.hostname, targets);
	const routing = routeActivationEligibility(options.state, record);
	return {
		hostname: record.hostname,
		siteId: record.siteId,
		canonicalSiteUrl: canonicalSiteUrl(options.aliasId, record.siteId),
		mode: record.mode,
		ownership: ownershipPlan(record),
		delegation: delegationPlan(record),
		routing: {
			state: record.routeState,
			canActivate: routing.eligible,
			blockers: routing.blockers,
			targetAvailable: Boolean(records.direct.length || records.cname.length),
			options: records
		},
		tls: domainTlsStatus(record),
		awtsmoosNameservers: {
			available: false,
			reason: 'AWTSMOOS_NAMESERVERS_UNAVAILABLE'
		}
	};
}

function ownershipPlan(record) {
	return {
		state: record.ownershipState,
		record: {
			type: 'TXT',
			name: verificationName(record.hostname),
			value: verificationValue(record.verificationToken),
			required: true,
			purpose: 'domain-ownership'
		}
	};
}

function delegationPlan(record) {
	return {
		required: record.mode === 'custom-nameservers',
		state: record.delegationState,
		expectedNameservers: [...record.nameservers]
	};
}

function canonicalSiteUrl(aliasId, siteId) {
	return `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`;
}

module.exports = {
	domainHostingPlan
};
