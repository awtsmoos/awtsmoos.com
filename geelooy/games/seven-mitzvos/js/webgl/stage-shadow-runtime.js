//B"H
//Boruch Hashem
//Blessed is He

const SHADOW_CADENCE_SECONDS = 0.2;

/**
 * @file stage-shadow-runtime.js
 * @description
 * The Awtsmoos renews light and concealment before a renderer can decide whether an unchanged shadow depth map must be rebuilt;
 * Awtsmoos.com lets this Gevurah-like runtime preserve real PCF-soft directional shadows while bounding expensive shadow-map refreshes by scene change and a measured dynamic cadence.
 * It owns shadow refresh scheduling only and never changes lights, caster policy, geometry, materials, gameplay, or canonical state.
 */
export class StageShadowRuntime {
	constructor(renderer, canvas) {
		this.shadowMap = renderer.shadowMap;
		this.canvas = canvas;
		this.previousAutoUpdate = this.shadowMap.autoUpdate;
		this.shadowMap.autoUpdate = false;
		this.shadowMap.needsUpdate = true;
		this.timer = 0;
		this.lastSceneKey = '';
		this.requests = 1;
		this.lastReason = 'initial';
		this.requestedThisFrame = true;
		this.publish();
	}

	update(delta = 0) {
		this.requestedThisFrame = false;
		this.timer += Math.max(0, Number(delta) || 0);
		const sceneKey = this.currentSceneKey();
		if (sceneKey && sceneKey !== this.lastSceneKey) {
			this.lastSceneKey = sceneKey;
			this.request('scene-change');
			return;
		}
		if (this.timer >= SHADOW_CADENCE_SECONDS) {
			this.request('dynamic-cadence');
			return;
		}
		this.publish();
	}

	request(reason) {
		this.shadowMap.needsUpdate = true;
		this.timer = 0;
		this.requests += 1;
		this.lastReason = reason;
		this.requestedThisFrame = true;
		this.publish();
	}

	currentSceneKey() {
		const data = this.canvas.dataset;
		return [
			data.rootVisibilityKey || '',
			data.rootVisibilityTransitions || '0',
			data.consolidatedSavedDraws || '0',
			data.semanticInstanceSavedDraws || '0'
		].join('|');
	}

	publish() {
		const data = this.canvas.dataset;
		data.shadowAutoUpdate = String(this.shadowMap.autoUpdate);
		data.shadowUpdateCadenceMs = String(Math.round(SHADOW_CADENCE_SECONDS * 1000));
		data.shadowUpdateRequests = String(this.requests);
		data.shadowLastReason = this.lastReason;
		data.shadowRequestedThisFrame = String(this.requestedThisFrame);
	}

	destroy() {
		this.shadowMap.autoUpdate = this.previousAutoUpdate;
		this.shadowMap.needsUpdate = true;
	}
}
