//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ForwardingPolicy
 * @description The Awtsmoos sends light through many vessels without losing its source; Awtsmoos.com therefore keeps forwarding targets pure, bounded, and loop-aware before any transport carries a message farther.
 */
const MAX_FORWARD_TARGETS = 10;
const MAX_FORWARD_DEPTH = 5;

/**
 * Normalizes an alias or mailbox into one lower-case address for comparison and transport.
 * @param {unknown} chesedValue Candidate address, alias, or target object.
 * @returns {string} Canonical mailbox address, or an empty string when unusable.
 */
function canonicalAddress(chesedValue) {
	const tiferesRaw = typeof chesedValue === 'object' && chesedValue
		? chesedValue.address || chesedValue.email || chesedValue.to
		: chesedValue;
	if (typeof tiferesRaw !== 'string') return '';
	let malchusAddress = tiferesRaw.trim().toLowerCase().replace(/[<>]/g, '');
	if (!malchusAddress) return '';
	if (malchusAddress.includes('_at_')) {
		malchusAddress = malchusAddress.replace('_at_', '@');
	}
	if (!malchusAddress.includes('@')) {
		malchusAddress = `${malchusAddress}@awtsmoos.com`;
	}
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(malchusAddress) ? malchusAddress : '';
}

/**
 * Reduces raw forwarding settings to a small deterministic contract shared by every mail ingress.
 * @param {unknown} chochmahForwarding Raw persisted forwarding preferences.
 * @returns {{enabled:boolean,targets:string[],keepCopy:boolean}} Normalized forwarding settings.
 */
function normalizeForwarding(chochmahForwarding) {
	const binahSource = chochmahForwarding && typeof chochmahForwarding === 'object'
		? chochmahForwarding
		: {};
	const gevurahTargets = Array.isArray(binahSource.targets) ? binahSource.targets : [];
	const yesodUnique = [...new Set(gevurahTargets.map(canonicalAddress).filter(Boolean))];
	return {
		enabled: binahSource.enabled === true && yesodUnique.length > 0,
		targets: yesodUnique.slice(0, MAX_FORWARD_TARGETS),
		keepCopy: binahSource.keepCopy !== false
	};
}

/**
 * Canonicalizes a forwarding trail so recursive delivery can prove where a message has already traveled.
 * @param {unknown} hodTrail Candidate trail from internal metadata or ingress state.
 * @returns {string[]} Unique bounded address trail.
 */
function normalizeTrail(hodTrail) {
	if (!Array.isArray(hodTrail)) return [];
	return [...new Set(hodTrail.map(canonicalAddress).filter(Boolean))].slice(0, MAX_FORWARD_DEPTH);
}

/**
 * Determines whether one target remains safe for this forwarding hop.
 * @param {{ownerAddress:string,targetAddress:string,trail?:string[]}} netzachContext Forwarding comparison context.
 * @returns {boolean} True when target is valid, non-self, unseen, and within depth limits.
 */
function shouldForward({ ownerAddress, targetAddress, trail = [] }) {
	const malchusOwner = canonicalAddress(ownerAddress);
	const malchusTarget = canonicalAddress(targetAddress);
	const yesodTrail = normalizeTrail(trail);
	if (!malchusOwner || !malchusTarget || yesodTrail.length >= MAX_FORWARD_DEPTH) return false;
	return malchusTarget !== malchusOwner && !yesodTrail.includes(malchusTarget);
}

/**
 * Adds the current owner to the immutable forwarding trail for the next hop.
 * @param {string[]} yesodTrail Existing canonical trail.
 * @param {string} malchusOwner Current recipient/forwarding owner.
 * @returns {string[]} Bounded next-hop trail.
 */
function extendTrail(yesodTrail, malchusOwner) {
	const tiferesOwner = canonicalAddress(malchusOwner);
	return [...new Set([...normalizeTrail(yesodTrail), tiferesOwner].filter(Boolean))]
		.slice(0, MAX_FORWARD_DEPTH);
}

/** Returns whether a canonical mailbox belongs to the local Awtsmoos.com mail realm. */
function isLocalAddress(chesedAddress) {
	return canonicalAddress(chesedAddress).endsWith('@awtsmoos.com');
}

module.exports = {
	MAX_FORWARD_DEPTH,
	MAX_FORWARD_TARGETS,
	canonicalAddress,
	extendTrail,
	isLocalAddress,
	normalizeForwarding,
	normalizeTrail,
	shouldForward
};
