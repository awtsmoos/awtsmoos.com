//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAmbientLayer
 * @description The Awtsmoos glimmers behind the social world without touching its words or controls;
 * Awtsmoos.com reuses one canonical WebGL2 scene, silences scroll reaction, and falls back cleanly when the vessel is weak.
 */
import {
	ProceduralCosmicScene,
	choosePerformanceProfile
} from '../../../libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js';
import {
	collectAmbientSignals,
	shouldUseSocialAmbient,
	socialAmbientProfile
} from './SocialAmbientPolicy.js';

export class MalchusSocialAmbientLayer {
	constructor(documentRef = globalThis.document, windowRef = globalThis) {
		this.document = documentRef;
		this.window = windowRef;
		this.canvas = null;
		this.scene = null;
		this.started = false;
	}

	start() {
		if (this.started) return true;
		const body = this.document?.body;
		if (!body) return false;
		const signals = collectAmbientSignals(this.window.navigator || {}, this.window);
		if (!shouldUseSocialAmbient(signals)) return this.fallback('constrained');
		const motion = this.window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: false };
		const canonical = choosePerformanceProfile(this.window.navigator || {}, motion);
		const profile = socialAmbientProfile(canonical, signals);
		const canvas = this.document.createElement('canvas');
		canvas.className = 'awtsmoosSocialAmbient';
		canvas.setAttribute('aria-hidden', 'true');
		canvas.tabIndex = -1;
		canvas.dataset.profile = profile.name;
		canvas.dataset.particles = String(profile.particleCount);
		try {
			const scene = new ProceduralCosmicScene(canvas, { profile });
			if (!scene.available) return this.fallback('webgl-unavailable');
			scene.lifecycle.onScroll = () => {};
			body.prepend(canvas);
			if (!scene.start()) return this.fallback('start-failed');
			this.canvas = canvas;
			this.scene = scene;
			this.started = true;
			this.markMode('webgl');
			return true;
		} catch {
			canvas.remove();
			return this.fallback('webgl-error');
		}
	}

	fallback(reason) {
		this.document?.documentElement?.classList?.add('awtsmoosSocialAmbientFallback');
		if (this.document?.documentElement?.dataset) this.document.documentElement.dataset.ambientReason = reason;
		return false;
	}

	markMode(mode) {
		this.document?.documentElement?.classList?.remove('awtsmoosSocialAmbientFallback');
		this.document?.documentElement?.classList?.add(`awtsmoosSocialAmbient--${mode}`);
	}

	destroy() {
		this.scene?.destroy?.();
		this.canvas?.remove?.();
		this.scene = null;
		this.canvas = null;
		this.started = false;
		this.document?.documentElement?.classList?.remove('awtsmoosSocialAmbient--webgl', 'awtsmoosSocialAmbientFallback');
	}
}
