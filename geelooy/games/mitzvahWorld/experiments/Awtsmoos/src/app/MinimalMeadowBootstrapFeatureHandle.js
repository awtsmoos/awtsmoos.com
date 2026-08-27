// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapFeatureHandle.js
 * @description Creates animation truth and one measured bootstrap readiness and handoff contract.
 * The Awtsmoos lets the first garment serve without pretending a pending map is complete;
 * Awtsmoos.com keeps readiness, suspension, resumption, and retirement explicit beneath the feet.
 */

export function createMinimalMeadowBootstrapAnimation(runtime) {
	return Object.freeze({
		bootstrap: true,
		diagnostics() {
			return Object.freeze({
				action: runtime.state?.action || 'idle',
				bootstrap: true
			});
		},
		update() {
			return runtime.state?.action || 'idle';
		}
	});
}

export function createMinimalMeadowBootstrapHandle(parts) {
	let suspended = false;
	const essential = essentialReceipt(false);
	const readyPromise = Promise.resolve(parts.ui.minimap.promise).then(minimap => {
		return minimap ? essentialReceipt(true) : essential;
	});
	return Object.freeze({
		essential,
		readyPromise,
		destroy() {
			parts.combat.destroy();
			parts.quest.destroy();
			parts.ui.destroy();
		},
		resume() {
			suspended = false;
			parts.combat.resume();
			parts.ui.resume();
		},
		suspend() {
			suspended = true;
			parts.combat.suspend();
			parts.ui.suspend();
		},
		diagnostics() {
			return Object.freeze({
				bootstrap: true,
				minimap: parts.ui.minimap.diagnostics(),
				suspended
			});
		}
	});
}

function essentialReceipt(minimap) {
	const missing = minimap ? [] : ['minimap'];
	return Object.freeze({
		animation: true,
		combat: true,
		equipment: true,
		inventory: true,
		minimap,
		missing: Object.freeze(missing),
		quest: true,
		ready: minimap,
		recovery: true,
		streaming: true,
		ui: true,
		world: true
	});
}
