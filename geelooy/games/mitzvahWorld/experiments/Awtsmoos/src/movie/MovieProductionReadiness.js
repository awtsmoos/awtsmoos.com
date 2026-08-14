// B"H
// Boruch Hashem
// Blessed is He

/** Final no-fallback gate for deterministic production Shorts. */
import { MovieApiError } from './MovieApiError.js';
import { auditMovieProductionHumans } from './MovieProductionHumanAudit.js';
import { auditMovieProductionWorld } from './MovieProductionWorldAudit.js';

export function auditMovieProductionReadiness(session) {
	if (!session?.project?.metadata?.shortId) {
		return Object.freeze({ productionShort: false, ready: true });
	}
	const renderer = auditRenderer(session.runtime?.renderer);
	const humans = auditMovieProductionHumans(session.runtime, session.director);
	const world = auditMovieProductionWorld(session.runtime);
	return Object.freeze({
		humans,
		productionShort: true,
		ready: renderer.ready && humans.ready && world.ready,
		renderer,
		world
	});
}

export function assertMovieProductionReady(session) {
	const report = auditMovieProductionReadiness(session);
	if (report.ready) return report;
	throw new MovieApiError(
		'PRODUCTION_SHORT_NOT_VISUALLY_READY',
		'Production Short refused fallback surfaces, humans, textures, or animation.',
		{ report }
	);
}

function auditRenderer(renderer) {
	const delegate = renderer?.delegate;
	const name = delegate?.constructor?.name || renderer?.constructor?.name || '';
	const bootstrap = /BootstrapColorRenderer/i.test(name)
		|| (!delegate && typeof renderer?.hydrate === 'function');
	const failed = ['degraded', 'failed'].includes(renderer?.hydrationState);
	return Object.freeze({
		delegate: name || null,
		hydrationState: renderer?.hydrationState || null,
		ready: Boolean(renderer && !bootstrap && !failed)
	});
}
