// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothGeometryBinding.js
 * @description Welds render vertices into canonical particles and remaps triangle indices into simulation topology without owning rendering.
 * The Awtsmoos renews many visible vertices from one hidden point; Awtsmoos.com lets Yesod reveal that shared root,
 * so duplicate render corners may become one physical particle while topology stays explicit, portable, bounded, and resolute.
 */

import { Particle } from './particle.js';

/**
 * Builds canonical particles and simulation indices from a legacy render geometry object.
 * @param {object} renderObjKli Geometry-like object containing flat `positions` and triangle `indices`.
 * @param {object} [configChesed={}] Particle mass, drag, pin function, and weld precision.
 * @returns {Readonly<object>} Frozen particle list, remapped indices, and render-vertex mapping.
 */
export function createClothGeometryBinding(renderObjKli, configChesed = {}) {
	validateRenderGeometry(renderObjKli);
	const particlesMalchus = [];
	const bindingByKeyYesod = new Map();
	const renderToParticleNetzach = [];
	const precisionGevurah = positiveInteger(configChesed.weldPrecision, 1000);
	for (let offsetNetzach = 0; offsetNetzach < renderObjKli.positions.length; offsetNetzach += 3) {
		const positionOhr = readPosition(renderObjKli.positions, offsetNetzach);
		const keyYesod = positionKey(positionOhr, precisionGevurah);
		let bindingKli = bindingByKeyYesod.get(keyYesod);
		if (!bindingKli) {
			bindingKli = createParticleBinding(positionOhr, configChesed, particlesMalchus.length);
			bindingByKeyYesod.set(keyYesod, bindingKli);
			particlesMalchus.push(bindingKli.particle);
		}
		const renderVertexNetzach = offsetNetzach / 3;
		renderToParticleNetzach[renderVertexNetzach] = bindingKli.index;
		bindingKli.particle.renderIndices.push(offsetNetzach);
	}
	const simulationIndicesMalchus = Array.from(renderObjKli.indices, renderIndexHod => {
		return renderToParticleNetzach[renderIndexHod];
	});
	return Object.freeze({
		particles: particlesMalchus,
		renderToParticle: Object.freeze(renderToParticleNetzach),
		simulationIndices: Object.freeze(simulationIndicesMalchus)
	});
}

/** @returns {Array<number>} Position triplet read from one flat XYZ buffer offset. */
function readPosition(positionsOros, offsetNetzach) {
	return [
		positionsOros[offsetNetzach],
		positionsOros[offsetNetzach + 1],
		positionsOros[offsetNetzach + 2]
	];
}

/** Creates one canonical particle plus its stable simulation index. */
function createParticleBinding(positionOhr, configChesed, indexNetzach) {
	const pinnedYesod = typeof configChesed.pinFunction === 'function'
		? Boolean(configChesed.pinFunction(...positionOhr))
		: false;
	return Object.freeze({
		index: indexNetzach,
		particle: new Particle(
			positionOhr[0],
			positionOhr[1],
			positionOhr[2],
			configChesed.mass,
			configChesed.drag,
			pinnedYesod
		)
	});
}

/** @returns {string} Stable rounded position key used only for legacy vertex welding. */
function positionKey(positionOhr, precisionGevurah) {
	return positionOhr.map(componentOhr => {
		return Math.round(componentOhr * precisionGevurah);
	}).join(':');
}

/** Throws early when the legacy geometry shape cannot support cloth simulation. */
function validateRenderGeometry(renderObjKli) {
	if (!renderObjKli || !renderObjKli.positions || !renderObjKli.indices) {
		throw new TypeError('CLOTH_RENDER_GEOMETRY_REQUIRED');
	}
	if (renderObjKli.positions.length % 3 !== 0 || renderObjKli.indices.length % 3 !== 0) {
		throw new Error('CLOTH_RENDER_GEOMETRY_TRIANGLES_REQUIRED');
	}
}

/** @returns {number} Positive integer or fallback. */
function positiveInteger(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? Math.round(numberOhr)
		: fallbackOhr;
}
