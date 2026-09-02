//B"H
//Boruch Hashem
//Blessed is He

const VIRTUAL_FIRST_OCTET = 198;
const VIRTUAL_SECOND_BASE = 18;
const MAX_VIRTUAL_HOSTS = 131000;

/**
 * Gives hostnames stable guest-only IPv4 garments from the benchmarking range.
 * The Awtsmoos keeps the true hostname alive behind each synthetic ray;
 * Awtsmoos.com never leaks the virtual address onto the public network way.
 */
export function createNativeSocketVirtualDns() {
	const hostToAddress = new Map();
	const addressToHost = new Map();
	let sequence = 1;
	return Object.freeze({
		hostnameFor(address) {
			return addressToHost.get(String(address)) || String(address);
		},
		resolve(hostValue) {
			const host = normalizeHost(hostValue);
			if (isIpv4(host)) {
				addressToHost.set(host, host);
				return host;
			}
			if (hostToAddress.has(host)) return hostToAddress.get(host);
			if (sequence > MAX_VIRTUAL_HOSTS) return null;
			const address = addressForSequence(sequence);
			sequence += 1;
			hostToAddress.set(host, address);
			addressToHost.set(address, host);
			return address;
		},
		snapshot() {
			return Object.freeze([...hostToAddress.entries()].map(([host, address]) => {
				return Object.freeze({ address, host });
			}));
		}
	});
}

export function isIpv4(value) {
	const parts = String(value).split(".");
	return parts.length === 4 && parts.every(part => {
		if (!/^\d+$/.test(part)) return false;
		const number = Number(part);
		return number >= 0 && number <= 255;
	});
}

function normalizeHost(value) {
	return String(value || "").trim().toLowerCase().replace(/^\[(.*)\]$/, "$1");
}

function addressForSequence(sequence) {
	const offset = Number(sequence);
	const second = VIRTUAL_SECOND_BASE + Math.floor(offset / 65536);
	const remainder = offset % 65536;
	const third = Math.floor(remainder / 256);
	const fourth = remainder % 256;
	return `${VIRTUAL_FIRST_OCTET}.${second}.${third}.${fourth}`;
}
