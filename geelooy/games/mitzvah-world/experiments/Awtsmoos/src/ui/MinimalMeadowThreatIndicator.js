// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowThreatIndicator.js
 * @description Converts existing enemy combat events into one brief readable warning channel.
 * The Awtsmoos reveals intention before impact and release after danger; Awtsmoos.com keeps one
 * timer, one pointer-transparent node, and no duplicate combat authority behind visible threat text.
 */

import {
	installMinimalMeadowThreatIndicatorStyles
} from './MinimalMeadowThreatIndicatorStyles.js';

const EVENTS = Object.freeze([
	'enemy:alert',
	'enemy:cast',
	'enemy:melee',
	'enemy:projectile',
	'enemy:miss',
	'enemy:return',
	'player:damage-blocked'
]);

export class MinimalMeadowThreatIndicator {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.timer = null;
		this.shown = 0;
		installMinimalMeadowThreatIndicatorStyles(documentValue);
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-threat-indicator';
		this.root.setAttribute('aria-live', 'assertive');
		documentValue.body.append(this.root);
		this.unsubscribers = EVENTS.map(name => runtime.bus.on(name, event => {
			this.show(threatReceipt(name, event));
		}));
	}

	show(receipt) {
		if (!receipt) return false;
		this.clearTimer();
		this.root.dataset.level = receipt.level;
		this.root.dataset.open = 'true';
		this.root.innerHTML = `<span>${receipt.icon}</span><div><strong>${escapeHtml(receipt.title)}</strong><small>${escapeHtml(receipt.detail)}</small></div>`;
		this.shown += 1;
		this.timer = this.environment.setTimeout?.(() => {
			this.root.dataset.open = 'false';
		}, receipt.duration);
		return true;
	}

	clearTimer() {
		if (this.timer != null) this.environment.clearTimeout?.(this.timer);
		this.timer = null;
	}

	diagnostics() {
		return {
			events: EVENTS.length,
			open: this.root.dataset.open === 'true',
			shown: this.shown
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.clearTimer();
		this.root.remove();
	}
}

export function threatReceipt(name, event = {}) {
	const enemy = event.enemy?.name || event.name || event.enemyId || 'A shadow';
	if (name === 'enemy:alert') return receipt('⚠️', `${enemy} noticed you`, 'Watch the windup before answering.', 'warning', 1800);
	if (name === 'enemy:cast') return receipt('✨', `${enemy} is casting ${event.letters || ''}`.trim(), 'Move aside before the letters release.', 'danger', Math.max(900, Number(event.duration) * 1000 || 1700));
	if (name === 'enemy:projectile') return receipt('☄️', 'A hostile letter is moving', 'Keep moving until it passes.', 'danger', 1500);
	if (name === 'enemy:melee') return receipt('💥', `Received ${Math.round(event.damage || 0)} damage`, 'Create distance during recovery.', 'danger', 1300);
	if (name === 'enemy:miss') return receipt('💨', 'Attack avoided', 'The opening is yours.', 'safe', 1000);
	if (name === 'player:damage-blocked') return receipt('🛡️', 'Damage blocked', 'Your protection held.', 'safe', 1000);
	if (name === 'enemy:return') return receipt('🌿', `${enemy} broke pursuit`, 'You are outside the encounter.', 'safe', 1200);
	return null;
}

function receipt(icon, title, detail, level, duration) {
	return Object.freeze({ detail, duration, icon, level, title });
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });
