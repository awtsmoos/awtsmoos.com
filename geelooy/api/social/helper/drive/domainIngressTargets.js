//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainIngressTargets
 * @description
 * The Awtsmoos lets many domains face one shared edge without making the edge
 * their authority. Awtsmoos.com reveals only ingress targets actually configured,
 * so no imagined A, AAAA, or CNAME record is ever offered as production truth.
 */

const net = require('net');
const {
	normalizeDnsHostname,
	domainError
} = require('./domainHostnamePolicy.js');

const IPV4_KEY = 'AWTSMOOS_SITE_INGRESS_IPV4';
const IPV6_KEY = 'AWTSMOOS_SITE_INGRESS_IPV6';
const HOST_KEY = 'AWTSMOOS_SITE_INGRESS_HOSTNAME';

function readDomainIngressTargets(environment = process.env) {
	const ipv4 = addressList(environment[IPV4_KEY], 4, 'INVALID_SITE_INGRESS_IPV4');
	const ipv6 = addressList(environment[IPV6_KEY], 6, 'INVALID_SITE_INGRESS_IPV6');
	const hostname = edgeHostname(environment[HOST_KEY]);
	return {
		ipv4,
		ipv6,
		hostname,
		available: Boolean(ipv4.length || ipv6.length || hostname)
	};
}

function routingRecordOptions(hostname, targets = readDomainIngressTargets()) {
	const name = normalizeDnsHostname(hostname, 'INVALID_DOMAIN_HOSTNAME');
	const direct = [
		...targets.ipv4.map(value => record('A', name, value, 'shared-ipv4-ingress')),
		...targets.ipv6.map(value => record('AAAA', name, value, 'shared-ipv6-ingress'))
	];
	const cname = [];
	if (targets.hostname) {
		cname.push(record('CNAME', name, targets.hostname, 'stable-awtsmoos-edge'));
	}
	return {
		direct,
		cname
	};
}

function addressList(value, version, errorCode) {
	const values = uniqueCsv(value);
	for (const address of values) {
		if (net.isIP(address) !== version) {
			throw domainError(errorCode, 500);
		}
	}
	return values;
}

function edgeHostname(value) {
	const raw = String(value || '').trim();
	if (!raw) {
		return null;
	}
	if (net.isIP(raw)) {
		throw domainError('INVALID_SITE_INGRESS_HOSTNAME', 500);
	}
	try {
		return normalizeDnsHostname(raw, 'INVALID_SITE_INGRESS_HOSTNAME');
	} catch {
		throw domainError('INVALID_SITE_INGRESS_HOSTNAME', 500);
	}
}

function uniqueCsv(value) {
	const values = String(value || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
	return [...new Set(values)];
}

function record(type, name, value, purpose) {
	return {
		type,
		name,
		value,
		required: true,
		purpose
	};
}

module.exports = {
	IPV4_KEY,
	IPV6_KEY,
	HOST_KEY,
	readDomainIngressTargets,
	routingRecordOptions
};
