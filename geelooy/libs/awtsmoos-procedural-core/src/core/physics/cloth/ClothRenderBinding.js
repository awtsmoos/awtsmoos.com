// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothRenderBinding.js
 * @description Copies canonical cloth particle positions and already-computed physics normals into legacy render buffers without owning simulation math.
 * The Awtsmoos renews the physical garment before pixels receive its form; Awtsmoos.com lets Malchus manifest positions and normals without stealing their law,
 * so rendering remains a faithful vessel while aerodynamics, headless worlds, and tests share one deeper source beneath what users saw.
 */

/** Legacy-compatible render synchronizer consuming canonical particle state. */
export class ClothRenderBinding {
	/**
	 * @param {object|null} renderObjKli Legacy render geometry object or null for headless simulation.
	 * @param {Readonly<Array<number>>} renderToParticleNetzach Render-vertex to canonical particle mapping.
	 */
	constructor(renderObjKli, renderToParticleNetzach = []) {
		this.renderObj = renderObjKli || null;
		this.renderToParticle = renderToParticleNetzach;
	}

	/**
	 * Writes canonical positions and physical smooth normals into legacy render buffers.
	 * @param {Array<object>} particlesMalchus Canonical cloth particles containing `pos` and `accumulatedNormal`.
	 * @returns {void}
	 */
	sync(particlesMalchus) {
		if (!this.renderObj) {
			return;
		}

		for (
			let renderVertexNetzach = 0;
			renderVertexNetzach < this.renderToParticle.length;
			renderVertexNetzach += 1
		) {
			const particleIndexNetzach = this.renderToParticle[
				renderVertexNetzach
			];
			const particleMalchus = particlesMalchus[
				particleIndexNetzach
			];
			writeVertex(
				this.renderObj,
				renderVertexNetzach,
				particleMalchus.pos,
				particleMalchus.accumulatedNormal || [0, 1, 0]
			);
		}

		this.renderObj.dirty = true;
	}
}

/**
 * Copies one canonical XYZ position/normal pair into flat legacy render buffers.
 * @param {object} renderObjKli Mutable legacy geometry buffers.
 * @param {number} renderVertexNetzach Render vertex index.
 * @param {Array<number>} positionOhr Canonical particle position.
 * @param {Array<number>} normalOhr Canonical physical surface normal.
 * @returns {void}
 */
function writeVertex(
	renderObjKli,
	renderVertexNetzach,
	positionOhr,
	normalOhr
) {
	const offsetNetzach = renderVertexNetzach * 3;
	for (let axisHod = 0; axisHod < 3; axisHod += 1) {
		renderObjKli.positions[offsetNetzach + axisHod] = positionOhr[axisHod];
		if (renderObjKli.normals) {
			renderObjKli.normals[offsetNetzach + axisHod] = normalOhr[axisHod];
		}
	}
}
