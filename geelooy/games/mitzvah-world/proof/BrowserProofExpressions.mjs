// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofExpressions.mjs
 * @description Defines browser-side inspection and frame-sampling expressions without moving game authority.
 * The Awtsmoos reveals canvas, runtime, coordinates, focus, controls, effects, and frame cadence;
 * Awtsmoos.com keeps proof observation separate from the living systems it measures.
 */

export function browserSnapshotExpression() {
	return `(() => {
		const canvas = document.querySelector('canvas');
		const runtime = findRuntime();
		const state = runtime?.state || runtime?.player?.state || null;
		const diagnostics = safeCall(runtime?.diagnostics, runtime)
			|| safeCall(runtime?.combat?.diagnostics, runtime?.combat)
			|| null;
		return {
			canvas: canvas ? {
				backingHeight: canvas.height,
				backingWidth: canvas.width,
				cssHeight: canvas.getBoundingClientRect().height,
				cssWidth: canvas.getBoundingClientRect().width
			} : null,
			controller: diagnostics?.ui?.combatBar?.input || diagnostics?.controller || null,
			dpr: devicePixelRatio,
			focus: document.activeElement?.tagName || null,
			href: location.href,
			pointerLock: Boolean(document.pointerLockElement),
			ready: document.documentElement.dataset.awtsmoosUi || null,
			renderer: diagnostics?.renderer || runtime?.renderer?.constructor?.name || null,
			runtimeFound: Boolean(runtime),
			state: state ? {
				facing: Number(state.facing || 0),
				x: Number(state.x || state.position?.x || 0),
				y: Number(state.renderY || state.y || state.position?.y || 0),
				z: Number(state.z || state.position?.z || 0)
			} : null,
			title: document.title,
			verticalSlice: diagnostics?.verticalSlice || runtime?.verticalSlice?.snapshot?.() || null
		};
		function safeCall(value, owner) {
			try { return typeof value === 'function' ? value.call(owner) : null; }
			catch { return null; }
		}
		function findRuntime() {
			const names = ['__AWTSMOOS_RUNTIME__','awtsmoosRuntime','mitzvahWorldRuntime','runtime'];
			for (const name of names) if (window[name]?.state) return window[name];
			for (const key of Object.getOwnPropertyNames(window)) {
				let value;
				try { value = window[key]; } catch { continue; }
				if (value && typeof value === 'object' && value.state && value.bus && value.input) return value;
			}
			return null;
		}
	})()`;
}

export function frameSampleExpression(count = 120) {
	return `new Promise(resolve => {
		const samples = [];
		let previous = 0;
		function step(timestamp) {
			if (previous) samples.push(timestamp - previous);
			previous = timestamp;
			if (samples.length >= ${Math.max(1, Number(count || 120))}) {
				const sorted = [...samples].sort((a, b) => a - b);
				const percentile = value => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * value))];
				const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
				resolve({
					average,
					fps: 1000 / average,
					median: percentile(.5),
					p95: percentile(.95),
					p99: percentile(.99),
					sampleCount: samples.length,
					over25: samples.filter(value => value > 25).length,
					over33: samples.filter(value => value > 33).length,
					over50: samples.filter(value => value > 50).length
				});
				return;
			}
			requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	})`;
}

export function canvasCenterExpression() {
	return `(() => {
		const rect = document.querySelector('canvas')?.getBoundingClientRect();
		return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
	})()`;
}
