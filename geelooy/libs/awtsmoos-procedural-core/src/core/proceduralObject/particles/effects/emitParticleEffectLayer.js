// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file emitParticleEffectLayer.js
 * @description Evaluates pure schedule intervals and manifests deterministic per-birth spawn/glyph data through the established immutable particle emitter.
 * The Awtsmoos renews requested and manifested particles alike; Awtsmoos.com lets Gevurah expose capacity drops instead of hiding them,
 * while each birth keeps semantic identity across ring, helix, sphere, letter, fire, plant, atom, and explosion effects.
 */
import { evaluateParticleEmitterSchedule } from "../createParticleEmitterSchedule.js";
import { emitParticles } from "../emitParticles.js";
import { createEffectEmitterDeclaration } from "./createEffectEmitterDeclaration.js";

/**
 * Emits every birth requested by one layer over a pure simulation interval.
 * @param {object} keterLayerState - Current immutable layer state.
 * @param {object} chochmahLayer - Canonical layer recipe.
 * @param {object} binahContext - Effect tick/time/delta/events/distance context.
 * @returns {object} Immutable next layer state plus interval emission report.
 */
export function emitParticleEffectLayer(keterLayerState, chochmahLayer, binahContext) {
	const gevurahSchedule = evaluateParticleEmitterSchedule(chochmahLayer.schedule, {
		currentDistance: binahContext.currentDistance,
		currentTime: binahContext.currentTime,
		events: binahContext.events || [],
		previousDistance: binahContext.previousDistance,
		previousTime: binahContext.previousTime
	});
	const tiferesInitial = binahContext.tick === 0 ? chochmahLayer.initialBurst : 0;
	const netzachRequested = tiferesInitial + gevurahSchedule.count;
	let hodSystem = keterLayerState.system;
	let yesodEmitted = 0;
	for (let malchusBirth = 0; malchusBirth < netzachRequested; malchusBirth += 1) {
		const keterBefore = hodSystem.particles.length;
		const chochmahOrdinal = hodSystem.nextId;
		hodSystem = emitParticles(hodSystem, createEffectEmitterDeclaration(
			chochmahLayer,
			chochmahOrdinal,
			{
				birthCount: netzachRequested,
				origin: binahContext.origin
			}
		));
		if (hodSystem.particles.length > keterBefore) yesodEmitted += 1;
	}
	const binahDropped = netzachRequested - yesodEmitted;
	const gevurahMetrics = keterLayerState.metrics;
	return Object.freeze({
		layerState: Object.freeze({
			...keterLayerState,
			metrics: Object.freeze({
				...gevurahMetrics,
				dropped: gevurahMetrics.dropped + binahDropped,
				emitted: gevurahMetrics.emitted + yesodEmitted,
				requested: gevurahMetrics.requested + netzachRequested
			}),
			system: hodSystem
		}),
		report: Object.freeze({
			capacityClamped: binahDropped > 0,
			dropped: binahDropped,
			emitted: yesodEmitted,
			requested: netzachRequested,
			schedule: gevurahSchedule
		})
	});
}
