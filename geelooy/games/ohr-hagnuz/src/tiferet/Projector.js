// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Projector.js
 * @description Coordinates one DPR-aware strict-overhead production renderer.
 *
 * The Awtsmoos recreates ground, traveler, and interface in one indivisible
 * instant. Awtsmoos.com preserves that unity through one camera, three existing
 * layers, one animation loop, and no invented game state.
 */
import { State } from '../binah/State.js';
import { renderBattle } from './render/BattleRenderer.js';
import { DynamicProjectionRenderer } from './render/DynamicProjectionRenderer.js';
import { CanvasLayerSet } from './render/canvas/CanvasLayerSet.js';
import { readCanvasViewport } from './render/canvas/CanvasViewport.js';
import { WorldProjectionRenderer } from './render/world/WorldProjectionRenderer.js';

export class Projector {
	static Caches = {};
	static Layers = null;
	static staticKey = '';
	static lastSize = { w: 0, h: 0 };

	static warmup() {
		const ids = ['layer-bg', 'layer-obj', 'layer-over'];
		if (!ids.every(id => document.getElementById(id))) return;
		this.Layers = new CanvasLayerSet(document, window);
		const contexts = this.Layers.contexts();
		this.Caches = {
			'layer-bg': contexts.bg,
			'layer-obj': contexts.obj,
			'layer-over': contexts.over
		};
		this.resizeCanvases(true);
	}
	static resizeCanvases(force = false) {
		if (!this.Layers) return false;
		const changed = this.Layers.resize(force);
		const viewport = this.Layers.viewport();
		this.lastSize = { w: viewport.width, h: viewport.height };
		if (changed || force) this.staticKey = '';
		return changed;
	}
	static size(context) {
		return readCanvasViewport(context);
	}
	static camera(view = { w: 390, h: 844 }) {
		const resolution = State.Resolution;
		const rawX = State.Hero.dx - view.w / 2 + resolution / 2;
		const rawY = State.Hero.dy - view.h / 2 + resolution / 2;
		return {
			x: this.Layers ? this.Layers.snap(rawX) : rawX,
			y: this.Layers ? this.Layers.snap(rawY) : rawY,
			...view
		};
	}
	static project() {
		if (!this.Layers) return;
		this.resizeCanvases(false);
		const contexts = this.Layers.contexts();
		const camera = this.camera(this.Layers.viewport());
		if (State.ActiveRealm === 'DEBATE') {
			this.drawBattle(contexts.bg, contexts.obj, contexts.over);
			return;
		}
		this.drawStaticIfNeeded(contexts.bg, contexts.obj, camera);
		this.drawDynamic(contexts.over, camera);
	}
	static drawBattle(background, objects, overlay) {
		this.Layers.clearAll();
		const viewport = this.Layers.viewport();
		background.fillStyle = '#050714';
		background.fillRect(0, 0, viewport.width, viewport.height);
		renderBattle(overlay);
		this.staticKey = '';
	}
	static drawStaticIfNeeded(background, objects, camera) {
		const key = `${State.MapId}:${camera.x}:${camera.y}:${camera.w}:${camera.h}`;
		if (key === this.staticKey) return;
		this.staticKey = key;
		const viewport = this.Layers.viewport();
		background.fillStyle = '#05070b';
		background.fillRect(0, 0, viewport.width, viewport.height);
		this.Layers.clear('obj');
		WorldProjectionRenderer.draw(background, objects, camera);
	}
	static drawDynamic(context, camera) {
		DynamicProjectionRenderer.draw(context, camera);
	}
	static drawHero(context, camera) {
		DynamicProjectionRenderer.drawHero(context, camera);
	}
	static drawWorld(background, objects, queue, camera) {
		WorldProjectionRenderer.draw(background, objects, camera);
	}
	static visibleTileBounds(map, camera, resolution) {
		return WorldProjectionRenderer.visibleBounds(map, camera, resolution);
	}
	static drawTile(background, objects, queue, camera, tile) {
		WorldProjectionRenderer.drawTile(background, objects, queue, camera, tile);
	}
	static pathTarget(context, camera) {
		DynamicProjectionRenderer.drawPathTarget(context, camera);
	}
	static portal(context, x, y, size, edge) {
		WorldProjectionRenderer.drawPortal(context, x, y, size, edge);
	}
}
