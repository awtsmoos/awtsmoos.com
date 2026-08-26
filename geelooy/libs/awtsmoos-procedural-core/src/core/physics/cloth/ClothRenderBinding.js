// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothRenderBinding.js
 * @description Keeps legacy render-buffer synchronization outside cloth simulation while preserving positions, smooth normals, and dirty signaling.
 * The Awtsmoos renews the simulated garment before any GPU buffer receives its light; Awtsmoos.com lets one adapter translate without taking command,
 * so physics remains renderer-neutral while existing games still see every fold, normal, and moving strand.
 */

import { Vec3 } from '../../math/vec3.js';

/** Legacy-compatible render synchronizer for cloth particles and indexed triangle geometry. */
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
	 * Writes canonical particle positions and area-weighted smooth normals into legacy render buffers.
	 * @param {Array<object>} particlesMalchus Canonical cloth particles.
	 * @returns {void}
	 */
	sync(particlesMalchus) {
		if (!this.renderObj) {
			return;
		}
		const normalsMalchus = createParticleNormals(
			particlesMalchus,
			this.renderObj.indices,
			this.renderToParticle
		);
		for (let renderVertexNetzach = 0; renderVertexNetzach < this.renderToParticle.length; renderVertexNetzach += 1) {
			const particleIndexNetzach = this.renderToParticle[renderVertexNetzach];
			writeVertex(
				this.renderObj,
				renderVertexNetzach,
				particlesMalchus[particleIndexNetzach].pos,
				normalsMalchus[particleIndexNetzach]
			);
		}
		this.renderObj.dirty = true;
	}
}

/** @returns {Array<Array<number>>} Area-weighted smooth normal per canonical particle. */
function createParticleNormals(particlesMalchus, renderIndicesOros, renderToParticleNetzach) {
	const normalsMalchus = particlesMalchus.map(() => [0, 0, 0]);
	for (let offsetNetzach = 0; offsetNetzach < renderIndicesOros.length; offsetNetzach += 3) {
		const firstHod = renderToParticleNetzach[renderIndicesOros[offsetNetzach]];
		const secondHod = renderToParticleNetzach[renderIndicesOros[offsetNetzach + 1]];
		const thirdHod = renderToParticleNetzach[renderIndicesOros[offsetNetzach + 2]];
		const normalOhr = Vec3.cross(
			Vec3.sub(particlesMalchus[secondHod].pos, particlesMalchus[firstHod].pos),
			Vec3.sub(particlesMalchus[thirdHod].pos, particlesMalchus[firstHod].pos)
		);
		normalsMalchus[firstHod] = Vec3.add(normalsMalchus[firstHod], normalOhr);
		normalsMalchus[secondHod] = Vec3.add(normalsMalchus[secondHod], normalOhr);
		normalsMalchus[thirdHod] = Vec3.add(normalsMalchus[thirdHod], normalOhr);
	}
	return normalsMalchus.map(normalOhr => {
		return Vec3.len(normalOhr) > 1e-12
			? Vec3.normalize(normalOhr)
			: [0, 1, 0];
	});
}

/** Writes one canonical position/normal pair into flat legacy buffers. */
function writeVertex(renderObjKli, renderVertexNetzach, positionOhr, normalOhr) {
	const offsetNetzach = renderVertexNetzach * 3;
	for (let axisHod = 0; axisHod < 3; axisHod += 1) {
		renderObjKli.positions[offsetNetzach + axisHod] = positionOhr[axisHod];
		if (renderObjKli.normals) {
			renderObjKli.normals[offsetNetzach + axisHod] = normalOhr[axisHod];
		}
	}
}
