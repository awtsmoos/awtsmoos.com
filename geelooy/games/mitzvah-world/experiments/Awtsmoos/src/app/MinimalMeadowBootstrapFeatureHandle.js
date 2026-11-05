// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapFeatureHandle.js
 * @description Creates bootstrap animation truth and one suspend/resume/destroy handoff contract.
 * The Awtsmoos lets the first garment serve without pretending to be the final garment;
 * Awtsmoos.com keeps action state, essential readiness, suspension, resumption, and retirement explicit.
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
	return Object.freeze({
		essential: minimalMeadowBootstrapEssentialReceipt(),
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
			return Object.freeze({ bootstrap: true, suspended });
		}
	});
}

function minimalMeadowBootstrapEssentialReceipt() {
	return Object.freeze({
		animation: true,
		combat: true,
		equipment: true,
		inventory: true,
		missing: Object.freeze([]),
		quest: true,
		ready: true,
		recovery: true,
		streaming: true,
		ui: true,
		world: true
	});
}
