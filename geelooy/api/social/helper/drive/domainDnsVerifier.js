//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainDnsVerifier
 * @description
 * The Awtsmoos lets public DNS testify without granting it more authority than it
 * bears. Awtsmoos.com verifies TXT ownership and optional NS delegation separately;
 * neither result silently activates HTTP routing or a certificate.
 */

const dns = require('dns');
const { normalizeDnsHostname } = require('./domainHostnamePolicy.js');

async function verifyDomainDns(record, resolver = dns.promises) {
	const txt = await verifyOwnershipTxt(record, resolver);
	const delegation = await verifyDelegation(record, resolver);
	return {
		ownershipVerified: txt.verified,
		delegationVerified: delegation.verified,
		observedNameservers: delegation.observed,
		txtName: verificationName(record.hostname),
		txtValue: verificationValue(record.verificationToken)
	};
}

async function verifyOwnershipTxt(record, resolver) {
	const rows = await resolveOrEmpty(() => resolver.resolveTxt(verificationName(record.hostname)));
	const values = rows.map(parts => parts.join(''));
	return { verified: values.includes(verificationValue(record.verificationToken)) };
}

async function verifyDelegation(record, resolver) {
	if (record.mode !== 'custom-nameservers') {
		return { verified: true, observed: [] };
	}
	const rows = await resolveOrEmpty(() => resolver.resolveNs(record.hostname));
	const observed = [...new Set(rows.map(name => normalizeDnsHostname(name)))].sort();
	const verified = record.nameservers.every(name => observed.includes(name));
	return { verified, observed };
}

function verificationName(hostname) {
	return `_awtsmoos-site.${hostname}`;
}

function verificationValue(token) {
	return `awtsmoos-verification=${token}`;
}

async function resolveOrEmpty(action) {
	try {
		return await action();
	} catch (error) {
		if (['ENODATA', 'ENOTFOUND', 'ESERVFAIL', 'ETIMEOUT'].includes(error.code)) return [];
		throw error;
	}
}

module.exports = {
	verifyDomainDns,
	verificationName,
	verificationValue
};
