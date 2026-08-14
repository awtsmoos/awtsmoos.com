//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteDomainStatus
 * @description
 * The Awtsmoos lets a project testify about its public names without revealing the
 * private seed from which ownership was proven. Awtsmoos.com compresses many domain
 * journeys into one honest shipping state while retaining each name's exact stage.
 */

function siteDomainStatusFromState(state, siteId) {
	const domains = Object.values(state?.domains || {})
		.filter(record => record.siteId === siteId)
		.map(publicDomainSummary)
		.sort((left, right) => left.hostname.localeCompare(right.hostname));
	return {
		status: aggregateDomainStatus(domains),
		attachedCount: domains.length,
		domains
	};
}

function publicDomainSummary(record) {
	return {
		hostname: record.hostname,
		mode: record.mode,
		status: domainRecordStatus(record),
		ownership: record.ownershipState,
		delegation: record.delegationState,
		routing: record.routeState,
		tls: record.tlsState
	};
}

function domainRecordStatus(record) {
	if (record.ownershipState !== 'verified') return 'ownership-pending';
	if (record.delegationState === 'pending') return 'dns-pending';
	if (record.routeState !== 'active') return 'route-pending';
	if (record.tlsState !== 'active') return 'tls-pending';
	return 'healthy';
}

function aggregateDomainStatus(domains) {
	if (!domains.length) return 'unattached';
	const order = [
		'ownership-pending',
		'dns-pending',
		'route-pending',
		'tls-pending',
		'healthy'
	];
	for (let index = order.length - 1; index >= 0; index -= 1) {
		if (domains.some(domain => domain.status === order[index])) return order[index];
	}
	return 'unattached';
}

module.exports = {
	siteDomainStatusFromState,
	publicDomainSummary,
	domainRecordStatus,
	aggregateDomainStatus
};
