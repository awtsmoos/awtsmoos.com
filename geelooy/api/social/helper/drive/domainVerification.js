//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainVerification
 * @description
 * The Awtsmoos lets public DNS become a witness without making DNS itself the owner;
 * Awtsmoos.com compares observed TXT secrets against one-way registry proof and observes delegation through injectable resolvers for honest tests.
 */

const dns = require('node:dns').promises;
const {
	domainChallengeName,
	extractDomainChallengeToken,
	verifyDomainChallenge
} = require('./domainChallenge.js');
const { normalizeNameserver } = require('./domainPolicy.js');

const ABSENT_CODES = new Set(['ENODATA', 'ENOTFOUND', 'ENOENT', 'ENONAME']);

async function verifyDomainTxt({ hostname, challengeHash, resolveTxt = dns.resolveTxt }) {
	try {
		const yesodRecords = await resolveTxt(domainChallengeName(hostname));
		const netzachTokens = yesodRecords
			.map((record) => extractDomainChallengeToken(record.join('')))
			.filter(Boolean);
		const tiferesVerified = netzachTokens.some((token) => {
			return verifyDomainChallenge(token, challengeHash);
		});
		return witnessResult(tiferesVerified, 'DNS_RECORD_NOT_FOUND');
	} catch (gevurahError) {
		return classifyDnsError(gevurahError);
	}
}

async function verifyNameserverDelegation({
	hostname,
	requestedNameservers,
	resolveNs = dns.resolveNs
}) {
	try {
		const yesodRecords = await resolveNs(hostname);
		const netzachObserved = [...new Set(
			yesodRecords.map(normalizeNameserver)
		)].sort();
		const hodRequested = [...new Set(requestedNameservers)].sort();
		const tiferesVerified = hodRequested.length === netzachObserved.length
			&& hodRequested.every((name, index) => name === netzachObserved[index]);
		return {
			...witnessResult(tiferesVerified, 'DNS_DELEGATION_NOT_FOUND'),
			observedNameservers: netzachObserved
		};
	} catch (gevurahError) {
		return {
			...classifyDnsError(gevurahError),
			observedNameservers: []
		};
	}
}

function witnessResult(verified, missingCode) {
	return {
		verified,
		errorCode: verified ? null : missingCode,
		transient: false
	};
}

function classifyDnsError(error) {
	const gevurahCode = String(error?.code || '').toUpperCase();
	if (ABSENT_CODES.has(gevurahCode)) {
		return witnessResult(false, 'DNS_RECORD_NOT_FOUND');
	}
	return {
		verified: false,
		errorCode: 'DNS_RESOLVER_ERROR',
		transient: true
	};
}

module.exports = {
	verifyDomainTxt,
	verifyNameserverDelegation
};
