// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionValidation.js
 * @description Emits stable issues for portable project state, optional world evidence, runtime animation proof, media, and render intent.
 * The Awtsmoos is beyond validation while finite vessels require honest gates; Awtsmoos.com names each contradiction precisely,
 * while an ordinary non-world Movie remains valid instead of being forced into geography it never requested.
 */

export function validateMovieReproduction(snapshot = {}) {
	const issues = [];
	check(issues, snapshot.schema?.version, 'SCHEMA_MISSING', 'schema.version', 'Reproduction schema version is required.');
	checkPositive(issues, snapshot.resolved?.timeline?.duration, 'DURATION_INVALID', 'resolved.timeline.duration');
	checkPositive(issues, snapshot.resolved?.timeline?.fps, 'FPS_INVALID', 'resolved.timeline.fps');
	checkPositive(issues, snapshot.resolved?.timeline?.frameCount, 'FRAME_COUNT_INVALID', 'resolved.timeline.frameCount');
	check(issues, snapshot.authored?.project, 'PROJECT_MISSING', 'authored.project', 'Portable authored project is required.');
	validateWorld(issues, snapshot.resolved?.world);
	validateMedia(issues, snapshot.resolved?.media);
	validateActor(issues, snapshot.resolved?.actor);
	validateRender(issues, snapshot.resolved?.render);
	const errors = issues.filter(issue => issue.severity === 'error');
	return Object.freeze({
		errorCount: errors.length,
		issues: Object.freeze(issues),
		ready: errors.length === 0,
		version: 1,
		warningCount: issues.length - errors.length
	});
}

function validateWorld(issues, world) {
	if (!world?.required) return;
	if (!world.resolvedId || world.kind === 'unresolved') {
		issue(issues, 'WORLD_UNRESOLVED', 'error', 'resolved.world.resolvedId', 'Requested physical world is unresolved.');
		return;
	}
	if (world.audit && !world.audit.ready) {
		issue(issues, 'WORLD_REALISM_FAILED', 'error', 'resolved.world.audit', 'World realism audit is not ready.');
	}
}

function validateMedia(issues, media) {
	for (const [index, asset] of (media?.assets || []).entries()) {
		if (!asset.url) issue(issues, 'MEDIA_URL_MISSING', 'error', `resolved.media.assets.${index}.url`, 'Media URL is required.');
		if (asset.status && asset.status !== 'online') issue(issues, 'MEDIA_NOT_ONLINE', 'warning', `resolved.media.assets.${index}.status`, `Media reports ${asset.status}.`);
	}
}

function validateActor(issues, actor) {
	if (!(actor?.clips || []).length) return;
	check(issues, actor.asset?.id, 'ACTOR_ASSET_MISSING', 'resolved.actor.asset.id', 'Canonical actor asset is required.');
	if (!actor.runtime?.verifiedAtRuntime) {
		issue(issues, 'ACTOR_RUNTIME_UNVERIFIED', 'warning', 'resolved.actor.runtime', 'Load chossid.glb and attach its exact animation catalog before final render.');
		return;
	}
	if (!actor.runtime.selectedClip) {
		issue(issues, 'ACTOR_MOTION_UNSELECTED', 'error', 'resolved.actor.runtime.selectedClip', 'Runtime animation evidence must identify the selected clip.');
		return;
	}
	if (actor.runtime.selectedClip.pose || Number(actor.runtime.selectedClip.duration || 0) <= 0) {
		issue(issues, 'ACTOR_MOTION_INVALID', 'error', 'resolved.actor.runtime.selectedClip', 'Final selected actor clip must have positive duration.');
	}
}

function validateRender(issues, render) {
	for (const field of ['width', 'height', 'fps', 'duration', 'frameCount']) {
		checkPositive(issues, render?.[field], `RENDER_${field.toUpperCase()}_INVALID`, `resolved.render.${field}`);
	}
}

function check(issues, value, code, path, message) {
	if (!value) issue(issues, code, 'error', path, message);
}

function checkPositive(issues, value, code, path) {
	if (!(Number(value) > 0)) issue(issues, code, 'error', path, `${path} must be positive.`);
}

function issue(issues, code, severity, path, message) {
	issues.push(Object.freeze({ code, message, path, severity }));
}
