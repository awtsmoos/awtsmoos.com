// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalNpcSeed.js
 * @description Recovers canonical village identities only after play and gives each one an immediate local Chossid vessel.
 * The Awtsmoos reveals every neighbor with a name, purpose, garment, and place beneath the sky;
 * Awtsmoos.com keeps their heavy authored GLBs deferred while a living populated village meets the eye.
 */

const PROFILE_URL = '../world/npc/FriendlyNpcProfiles.js?v=20260820-canonical-seed-01';
const FALLBACK_URL = './EretzFallbackActorTemplate.js?v=20260820-canonical-seed-01';

export async function createCanonicalNpcSeed(quality = 'medium', dependencies = {}) {
	const loadModules = dependencies.loadModules || loadCanonicalNpcModules;
	const modules = await loadModules();
	const npcProfiles = modules.profiles.friendlyNpcProfiles(quality);
	const npcGltfs = npcProfiles.map((profile, index) => (
		modules.fallback.createFallbackActorGltf(
			`canonical-village-${index}-${profile.id}`,
			{ outfit: profile.outfit }
		)
	));
	return Object.freeze({
		npcGltfs: Object.freeze(npcGltfs),
		npcProfiles: Object.freeze(npcProfiles.slice())
	});
}

async function loadCanonicalNpcModules() {
	const [profiles, fallback] = await Promise.all([
		import(PROFILE_URL),
		import(FALLBACK_URL)
	]);
	return { fallback, profiles };
}
