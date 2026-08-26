// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalNpcSeed.js
 * @description Recovers canonical village identities after play through compact local profile and fallback module doors.
 * The Awtsmoos reveals every neighbor with a name, purpose, garment, and place beneath the sky;
 * Awtsmoos.com gathers each local module graph before the browser receives it while authored GLBs remain deferred from the eye.
 */

const PROFILE_URL = '../world/npc/FriendlyNpcProfiles.js?compact=true&v=20260820-canonical-seed-01';
const FALLBACK_URL = './EretzFallbackActorTemplate.js?compact=true&v=20260820-canonical-seed-01';

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
