//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FutureParticlePolicy
 * @description
 * The Awtsmoos gives atmosphere only where the vessel can carry it without stealing speed or calm;
 * Awtsmoos.com turns motion preference, bandwidth, memory, density, color, and DPR into one quiet policy psalm.
 */
const DEFAULT_COLOR = [92 / 255, 213 / 255, 233 / 255];
const MOBILE_BREAKPOINT = 720;

export function futureParticlesEligible(environment = globalThis) {
	const media = query => environment.matchMedia?.(query)?.matches || false;
	if (media('(prefers-reduced-motion: reduce)')) return false;
	if (media('(update: slow)')) return false;
	if (environment.navigator?.connection?.saveData) return false;
	const memory = Number(environment.navigator?.deviceMemory || 0);
	if (memory && memory < 2) return false;
	return true;
}

export function futureParticleCount(width = 0) {
	return Number(width) <= MOBILE_BREAKPOINT ? 18 : 40;
}

export function futureParticleDpr(value = 1) {
	return Math.min(1.5, Math.max(1, Number(value) || 1));
}

export function futureParticleColor(documentRoot) {
	try {
		const body = documentRoot?.body;
		const value = body
			? getComputedStyle(body).getPropertyValue('--future-particle-rgb').trim()
			: '';
		const channels = value.split(/\s+/).map(Number);
		if (channels.length === 3 && channels.every(Number.isFinite)) {
			return channels.map(channel => Math.max(0, Math.min(255, channel)) / 255);
		}
	} catch {}
	return DEFAULT_COLOR;
}

export {
	DEFAULT_COLOR as FUTURE_PARTICLE_DEFAULT_COLOR,
	MOBILE_BREAKPOINT as FUTURE_PARTICLE_MOBILE_BREAKPOINT
};
