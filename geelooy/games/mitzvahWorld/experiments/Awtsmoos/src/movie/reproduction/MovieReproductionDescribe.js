// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionDescribe.js
 * @description Produces a verbose human reconstruction guide from the same immutable reproduction snapshot used by tools.
 * The Awtsmoos creates machine truth and human explanation together; Awtsmoos.com lets an editor read the vessel plainly,
 * while every line points back to structured fields rather than introducing another hidden interpretation of the post.
 */

export function describeMovieReproduction(snapshot = {}) {
	const timeline = snapshot.resolved?.timeline || {};
	const world = snapshot.resolved?.world || {};
	const actor = snapshot.resolved?.actor || {};
	const media = snapshot.resolved?.media || {};
	const composition = snapshot.resolved?.composition || {};
	const render = snapshot.resolved?.render || {};
	return [
		`Schema: ${snapshot.schema?.version || 'missing'}`,
		`Fingerprint: ${snapshot.fingerprint || 'unfingerprinted'}`,
		`Title: ${snapshot.identity?.title || 'Untitled movie'}`,
		`Timeline: ${timeline.duration || 0}s @ ${timeline.fps || 0}fps = ${timeline.frameCount || 0} frames`,
		`World: ${world.resolvedId || world.kind || 'none'}${world.requested ? ` (requested ${world.requested})` : ''}`,
		`Actor: ${actor.asset?.id || 'none'}; requested clips: ${(actor.clips || []).map(value => value.animationRequested).filter(Boolean).join(', ') || 'none'}`,
		`Runtime animation: ${actor.runtime?.selectedClip?.name || 'not yet verified'}`,
		`Media assets: ${(media.assets || []).length}; timed usages: ${(media.usages || []).length}`,
		`Composition: ${composition.resolution?.width || 0}x${composition.resolution?.height || 0} ${composition.orientation || ''}; layout ${composition.layout?.id || 'custom'}`,
		`Render: ${render.width || 0}x${render.height || 0} ${render.fps || 0}fps ${render.container || ''} ${render.video?.codec || ''}/${render.audio?.codec || ''}`,
		`Validation: ${snapshot.validation?.ready ? 'ready' : 'not ready'}; errors ${snapshot.validation?.errorCount || 0}; warnings ${snapshot.validation?.warningCount || 0}`
	].join('\n');
}
