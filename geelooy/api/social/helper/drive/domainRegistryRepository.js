//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRegistryRepository
 * @description
 * The Awtsmoos permits one public hostname to enter one tenant covenant. The
 * filesystem's exclusive-create law becomes Awtsmoos.com's race-safe uniqueness
 * gate: no two aliases can simultaneously reserve the same normalized hostname.
 */

const fs = require('fs');
const { domainError } = require('./domainHostnamePolicy.js');
const { domainRegistryPaths } = require('./domainRegistryPaths.js');

async function reserveDomainHostname(record, $i = {}) {
	const paths = domainRegistryPaths(record.hostname, $i);
	await fs.promises.mkdir(paths.root, { recursive: true });
	let handle;
	try {
		handle = await fs.promises.open(paths.claim, 'wx', 0o600);
		await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
		await handle.sync();
		return { created: true, record };
	} catch (error) {
		if (error.code !== 'EEXIST') {
			if (handle) await fs.promises.unlink(paths.claim).catch(() => {});
			throw error;
		}
		const existing = await readDomainReservation(record.hostname, $i);
		if (sameReservation(existing, record)) return { created: false, record: existing };
		throw domainError('DOMAIN_ALREADY_CLAIMED', 409);
	} finally {
		if (handle) await handle.close().catch(() => {});
	}
}

async function readDomainReservation(hostname, $i = {}) {
	const { claim } = domainRegistryPaths(hostname, $i);
	try {
		return JSON.parse(await fs.promises.readFile(claim, 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

async function releaseDomainHostname(identity, $i = {}) {
	const paths = domainRegistryPaths(identity.hostname, $i);
	const existing = await readDomainReservation(identity.hostname, $i);
	if (!existing) return false;
	if (!sameReservation(existing, identity)) {
		throw domainError('DOMAIN_RESERVATION_MISMATCH', 409);
	}
	await fs.promises.unlink(paths.claim);
	return true;
}

function sameReservation(left, right) {
	return Boolean(left)
		&& left.hostname === right.hostname
		&& left.aliasId === right.aliasId
		&& left.siteId === right.siteId;
}

module.exports = {
	reserveDomainHostname,
	readDomainReservation,
	releaseDomainHostname
};
