//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainView
 * @description
 * The Awtsmoos reveals exactly the testimony an owner needs and no imaginary
 * infrastructure. Awtsmoos.com shows verification and delegation instructions while
 * declaring ingress and TLS inactive until those server powers truly exist.
 */

const { verificationName, verificationValue } = require('./domainDnsVerifier.js');

function domainClaimView(aliasId, record) {
	return {
		hostname: record.hostname,
		siteId: record.siteId,
		canonicalSiteUrl: `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(record.siteId)}/`,
		mode: record.mode,
		nameservers: [...record.nameservers],
		status: domainStatus(record),
		verification: {
			name: verificationName(record.hostname),
			value: verificationValue(record.verificationToken),
			state: record.ownershipState,
			verifiedAt: record.verifiedAt
		},
		delegation: {
			state: record.delegationState,
			expectedNameservers: [...record.nameservers],
			verifiedAt: record.delegationVerifiedAt
		},
		routing: {
			state: record.routeState,
			available: false,
			reason: 'CUSTOM_HOST_INGRESS_NOT_ACTIVATED'
		},
		tls: {
			state: record.tlsState,
			available: false,
			reason: 'CUSTOM_HOST_TLS_NOT_ACTIVATED'
		},
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	};
}

function domainStatus(record) {
	if (record.ownershipState !== 'verified') return 'ownership-pending';
	if (record.delegationState === 'pending') return 'dns-pending';
	if (record.routeState !== 'active') return 'route-pending';
	if (record.tlsState !== 'active') return 'tls-pending';
	return 'healthy';
}

module.exports = {
	domainClaimView,
	domainStatus
};
