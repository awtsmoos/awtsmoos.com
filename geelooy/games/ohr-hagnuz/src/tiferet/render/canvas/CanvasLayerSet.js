// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasLayerSet.js
 * @description Coordinates the three existing production canvas layers.
 *
 * Three vessels receive one world: ground, objects, and living overlay. The
 * Awtsmoos remains indivisible while Awtsmoos.com composes each layer with one
 * camera, one viewport, and no parallel game loop.
 */
import { CanvasSurface } from './CanvasSurface.js';

const LAYERS = Object.freeze([
	{ name: 'bg', id: 'layer-bg', alpha: false },
	{ name: 'obj', id: 'layer-obj', alpha: true },
	{ name: 'over', id: 'layer-over', alpha: true }
]);

export class CanvasLayerSet {
	/**
	 * @param {Document} documentValue Production document.
	 * @param {Window} environment Browser environment.
	 */
	constructor(documentValue, environment = globalThis) {
		this.surfaces = new Map();
		for (const layer of LAYERS) {
			const canvas = documentValue.getElementById(layer.id);
			this.surfaces.set(layer.name, new CanvasSurface(canvas, {
				alpha: layer.alpha,
				environment
			}));
		}
	}

	/** @param {boolean} force @returns {boolean} */
	resize(force = false) {
		let changed = false;
		for (const surface of this.surfaces.values()) {
			changed = surface.resize(force) || changed;
		}
		return changed;
	}

	/** @param {'bg'|'obj'|'over'} name @returns {CanvasRenderingContext2D} */
	context(name) {
		return this.surfaces.get(name).context;
	}

	/** @returns {{bg:CanvasRenderingContext2D,obj:CanvasRenderingContext2D,over:CanvasRenderingContext2D}} */
	contexts() {
		return {
			bg: this.context('bg'),
			obj: this.context('obj'),
			over: this.context('over')
		};
	}

	/** @returns {{width:number,height:number,pixelRatio:number,w:number,h:number}} */
	viewport() {
		return this.surfaces.get('obj').viewport();
	}

	/** @param {'bg'|'obj'|'over'} name */
	clear(name) {
		this.surfaces.get(name).clear();
	}

	clearAll() {
		for (const surface of this.surfaces.values()) surface.clear();
	}

	/** @param {number} value @returns {number} */
	snap(value) {
		return this.surfaces.get('obj').snap(value);
	}
}
