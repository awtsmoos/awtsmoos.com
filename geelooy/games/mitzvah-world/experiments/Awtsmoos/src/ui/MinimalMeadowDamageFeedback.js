// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDamageFeedback.js
 * @description Renders one readable damage number and action seal for every successful player hit.
 * The Awtsmoos reveals measured consequence where the shadow was struck; Awtsmoos.com keeps each
 * numeral clamped, brief, pointer-transparent, action-aware, defeat-aware, and removed after testimony.
 */

import { minimalMeadowWorldToScreen } from './MinimalMeadowScreenProjection.js';
import {
	installMinimalMeadowDamageFeedbackStyles
} from './MinimalMeadowDamageFeedbackStyles.js';

export class MinimalMeadowDamageFeedback {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		installMinimalMeadowDamageFeedbackStyles(documentValue);
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-damage-feedback-layer';
		this.root.setAttribute('aria-live', 'polite');
		documentValue.body.append(this.root);
		this.active = new Set();
		this.unsubscribe = runtime.bus.on('combat:impact', receipt => this.show(receipt));
	}

	show(receipt = {}) {
		const damage = Math.max(0, Math.round(Number(receipt.damage) || 0));
		if (!damage) return null;
		const canvas = this.runtime.renderer?.domElement
			|| this.runtime.canvas
			|| this.documentValue.querySelector('canvas');
		const screen = minimalMeadowWorldToScreen(
			this.runtime.camera,
			canvas,
			receipt.position || this.runtime.camera?.target
		);
		const output = this.documentValue.createElement('output');
		output.className = 'Awtsmoos-damage-feedback';
		output.dataset.defeated = String(Boolean(receipt.defeated));
		output.style.setProperty('--damage-x', `${screen.x}px`);
		output.style.setProperty('--damage-y', `${screen.y}px`);
		const number = this.documentValue.createElement('strong');
		number.textContent = `−${damage}`;
		const action = this.documentValue.createElement('small');
		action.textContent = feedbackLabel(receipt);
		output.append(number, action);
		this.root.append(output);
		this.active.add(output);
		this.environment.setTimeout?.(() => this.remove(output), 980);
		return output;
	}

	remove(output) {
		output?.remove?.();
		this.active.delete(output);
	}

	diagnostics() {
		return {
			active: this.active.size,
			clampedWorldProjection: true,
			event: 'combat:impact',
			visibleDamageNumbers: true
		};
	}

	destroy() {
		this.unsubscribe?.();
		for (const output of this.active) output.remove();
		this.active.clear();
		this.root.remove();
	}
}

function feedbackLabel(receipt) {
	const letters = String(receipt.letters || '').trim();
	const action = String(receipt.label || receipt.actionId || 'Strike').trim();
	return letters ? `${letters} · ${action}` : action;
}
