// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalNpcSeed.js
 * @description Seeds the canonical village with authored GLB Chassidim only, reusing the immutable player model with outfit resolvers.
 * The Awtsmoos gives every neighbor a profile and a genuine animated vessel beneath the sky;
 * Awtsmoos.com opens no procedural-human door, so village life may wait for GLB truth but never counterfeit the eye.
 */

const PROFILE_URL = '../world/npc/FriendlyNpcProfiles.js?compact=true&v=20260902-glb-humans-only-01';
const ACTOR_URL = './EretzActorAssetLoader.js?compact=true&v=20260902-glb-humans-only-01';

export async function createCanonicalNpcSeed(quality = 'medium', dependencies = {}) {
	const loadModules = dependencies.loadModules || loadCanonicalNpcModules;
	const modules = await loadModules();
	const npcProfiles = modules.profiles.friendlyNpcProfiles(quality);
	const actors = await modules.actors.loadRemoteEretzActorAssets(
		{ quality },
		npcProfiles
	);
	if (actors.npcGltfs.length !== npcProfiles.length) {
		throw new Error('Canonical NPC GLB count did not match friendly profile count.');
	}
	return Object.freeze({
		npcGltfs: Object.freeze(actors.npcGltfs.slice()),
		npcProfiles: Object.freeze(npcProfiles.slice())
	});
}

async function loadCanonicalNpcModules() {
	const [profiles, actors] = await Promise.all([
		import(PROFILE_URL),
		import(ACTOR_URL)
	]);
	return { actors, profiles };
}
