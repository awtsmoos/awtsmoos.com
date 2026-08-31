//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayState.mjs
 * @description Reads mobile controls, post-play scheduler stages, canonical promotion, and real terrain-texture evidence from the running browser world.
 * The Awtsmoos reveals what the thumb can touch and which hidden doorway still waits beneath each recreated frame;
 * Awtsmoos.com refuses a green shell disguised as completion, so scheduler, joystick, terrain garment, and traveler testify with one name.
 */

/** Reads one serializable mobile gameplay snapshot from the strongest discoverable runtime. */
export async function readMobileGameplayState(command) {
	return evaluate(command, `(() => {
		const candidates = Object.keys(window).map(key => {
			try { return window[key]; } catch { return null; }
		}).filter(value => value && typeof value === 'object' && value.state && value.bus && value.input);
		const runtime = candidates.find(value => value.terrain?.group) || candidates[0] || null;
		const diagnostics = window.AwtsmoosDiagnostics || null;
		const ring = document.querySelector('.Awtsmoos-joystick-ring');
		const knob = document.querySelector('.Awtsmoos-joystick-knob');
		const host = document.querySelector('.Awtsmoos-mobile-joystick');
		const style = ring ? getComputedStyle(ring) : null;
		const ringRect = ring?.getBoundingClientRect?.() || null;
		const knobRect = knob?.getBoundingClientRect?.() || null;
		let terrainMesh = null;
		const visit = node => {
			if (!node || terrainMesh) return;
			if (node.name === 'Awtsmoos_high_detail_bezier_road_terrain') terrainMesh = node;
			for (const child of node.children || []) visit(child);
		};
		visit(runtime?.terrain?.group);
		const materials = Array.isArray(terrainMesh?.material) ? terrainMesh.material : [terrainMesh?.material].filter(Boolean);
		const material = materials.find(value => value?.mapImage || value?.map) || materials[0] || null;
		const imageInfo = image => {
			if (!image) return null;
			return {
				complete: image.complete !== false,
				height: Number(image.naturalHeight || image.videoHeight || image.height || 0),
				source: String(image.dataset?.publicUrl || image.currentSrc || image.src || ''),
				width: Number(image.naturalWidth || image.videoWidth || image.width || 0)
			};
		};
		const message = error => error?.message || String(error || '');
		const milestones = window.AwtsmoosMitzvahWorldStartup?.milestones || {};
		return {
			runtimeFound: Boolean(runtime),
			state: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z } : null,
			lastFrameError: runtime?.lastFrameError || null,
			milestones: Object.fromEntries(Object.entries(milestones).map(([name, value]) => [name, value.elapsedMilliseconds])),
			scheduler: {
				postPlayablePriorityStage: diagnostics?.postPlayablePriorityStage || null,
				postPlayablePriorityError: message(diagnostics?.postPlayablePriorityError),
				deferredEnrichmentStage: diagnostics?.deferredEnrichmentStage || null,
				deferredEnrichmentError: message(diagnostics?.deferredEnrichmentError),
				postPlayablePriorityPromise: Boolean(diagnostics?.postPlayablePriorityPromise),
				deferredEnrichmentPromise: Boolean(diagnostics?.deferredEnrichmentPromise)
			},
			canonical: {
				status: runtime?.canonicalWorldPromotion?.status || null,
				error: runtime?.canonicalWorldPromotion?.error || null,
				textureEvidence: runtime?.assets?.canonicalTerrainTextureEvidence || null
			},
			joystick: {
				ready: host?.dataset?.joystickReady === 'true',
				display: style?.display || null,
				visibility: style?.visibility || null,
				opacity: Number(style?.opacity || 0),
				ring: ringRect ? { left: ringRect.left, top: ringRect.top, width: ringRect.width, height: ringRect.height } : null,
				knob: knobRect ? { width: knobRect.width, height: knobRect.height } : null
			},
			terrain: {
				bootstrap: runtime?.terrain?.stats?.bootstrap === true,
				meshFound: Boolean(terrainMesh),
				meshVisible: terrainMesh?.visible !== false,
				mapImage: imageInfo(material?.mapImage || material?.map?.image || material?.map?.source?.data),
				mixImage: imageInfo(material?.mixImage),
				realBaseImage: material?.texturePolicy?.realBaseImage === true,
				realMixImage: material?.texturePolicy?.realMixImage === true
			},
			viewport: { width: innerWidth, height: innerHeight, touchPoints: navigator.maxTouchPoints || 0 }
		};
	})()`);
}

/** Evaluates one browser expression and returns only its by-value result. */
export async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	return result.result.value;
}
