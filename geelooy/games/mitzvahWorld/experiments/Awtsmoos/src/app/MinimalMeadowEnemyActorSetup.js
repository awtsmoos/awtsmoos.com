// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActorSetup.js
 * @description Compiles one enemy profile, creates its body, state, waypoints, scale, and ground placement.
 * The Awtsmoos gives one finite creature a visible vessel before motion begins;
 * Awtsmoos.com keeps compilation, posture, geometry, combat, patrol, health, and spawn aligned.
 */

import { createMinimalShadowCreatureMesh } from './MinimalMeadowCreatureMesh.js';
import { MinimalMeadowEnemyCombat } from './MinimalMeadowEnemyCombat.js';
import {
	createMinimalMeadowEnemyActorState
} from './MinimalMeadowEnemyActorState.js';
import {
	minimalShadowEnemyProfile,
	minimalShadowWaypoints
} from './MinimalMeadowEnemyProfile.js';

export function initializeMinimalMeadowEnemyActor(actor, options) {
	actor.profile = minimalShadowEnemyProfile(
		options.compiled,
		options.profile
	);
	Object.assign(
		actor,
		createMinimalMeadowEnemyActorState(options, actor.profile)
	);
	actor.group = createMinimalShadowCreatureMesh(
		options.compiled,
		actor.profile
	);
	actor.waypoints = minimalShadowWaypoints(actor.profile);
	actor.health = actor.profile.maxHealth;
	actor.combat = new MinimalMeadowEnemyCombat(actor, actor.runtime);
	applyEnemyBodyScale(actor.group, actor.profile);
	actor.group.position.set(
		actor.profile.x,
		actor.ground(actor.profile.x, actor.profile.z),
		actor.profile.z
	);
	return actor;
}

function applyEnemyBodyScale(group, profile) {
	const body = profile.bodyScale || [1, 1, 1];
	const visual = Number(profile.visualScale) || 1;
	group.scale.set(
		visual * body[0],
		visual * body[1],
		visual * body[2]
	);
}
