// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stepParticleEffect.js
 * @description Advances a layered effect by composing pure schedule emission, the mature advanced particle integrator, and post-physics lifecycle curves.
 * The Awtsmoos renews birth, movement, collision, fading, and cooling in one present; Awtsmoos.com lets Tiferes join these proven vessels in order,
 * so public effects become powerful without replacing simulation truth, hiding clocks, or allowing one preset to invent a private physics universe.
 */
import { stepAdvancedParticleSystem } from "../stepAdvancedParticleSystem.js";
import { applyParticleEffectLifecycle } from "./applyParticleEffectLifecycle.js";
import { emitParticleEffectLayer } from "./emitParticleEffectLayer.js";

/**
 * Advances one immutable high-level effect state.
 * @param {object} keterState - Current `awtsmoos.particle-effect-state`.
 * @param {object} [chochmahOptions={}] - Delta, collisions, events, distances, origin, and optional shared forces.
 * @returns {{state:object,report:object}} Next state plus per-layer evidence.
 */
export function stepParticleEffect(keterState, chochmahOptions = {}) {
	const binahDelta = Math.max(0, Number(chochmahOptions.deltaTime ?? 1 / 60));
	const gevurahCurrentTime = keterState.time + binahDelta;
	const tiferesReports = [];
	const netzachLayers = keterState.layers.map((hodLayerState, yesodIndex) => {
		const malchusLayer = keterState.recipe.layers[yesodIndex];
		const keterEmission = emitParticleEffectLayer(hodLayerState, malchusLayer, {
			currentDistance: chochmahOptions.currentDistance,
			currentTime: gevurahCurrentTime,
			events: chochmahOptions.events || [],
			origin: chochmahOptions.origin,
			previousDistance: chochmahOptions.previousDistance,
			previousTime: keterState.time,
			tick: keterState.tick
		});
		const chochmahBeforeStep = keterEmission.layerState.system.particles.length;
		const binahStep = stepAdvancedParticleSystem(keterEmission.layerState.system, {
			...chochmahOptions,
			deltaTime: binahDelta,
			forces: [...malchusLayer.forces, ...(chochmahOptions.forces || [])],
			seed: malchusLayer.seed
		});
		const gevurahExpired = Math.max(0, chochmahBeforeStep - binahStep.system.particles.length);
		const tiferesSystem = applyParticleEffectLifecycle(binahStep.system, malchusLayer, binahDelta);
		const netzachMetrics = keterEmission.layerState.metrics;
		tiferesReports.push(Object.freeze({
			...keterEmission.report,
			expired: gevurahExpired,
			integration: binahStep.report,
			layerId: malchusLayer.id,
			live: tiferesSystem.particles.length
		}));
		return Object.freeze({
			...keterEmission.layerState,
			metrics: Object.freeze({
				...netzachMetrics,
				expired: netzachMetrics.expired + gevurahExpired
			}),
			system: tiferesSystem
		});
	});
	const hodState = Object.freeze({
		...keterState,
		layers: Object.freeze(netzachLayers),
		tick: keterState.tick + 1,
		time: gevurahCurrentTime
	});
	return Object.freeze({
		report: Object.freeze({ deltaTime: binahDelta, layers: Object.freeze(tiferesReports) }),
		state: hodState
	});
}
