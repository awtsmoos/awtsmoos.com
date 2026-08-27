// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionBanner.js
 * @description Shows brief location, discovery, atmosphere, and safety testimony on region changes.
 * The Awtsmoos lets a place announce itself without becoming a wall; Awtsmoos.com keeps one
 * pointer-transparent banner, one bounded timer, and one truthful subscription to world movement.
 */

import {
	installMinimalMeadowRegionBannerStyles
} from './MinimalMeadowRegionBannerStyles.js';

const DISPLAY_MILLISECONDS = 2800;

export class MinimalMeadowRegionBanner {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.timer = null;
		this.shown = 0;
		installMinimalMeadowRegionBannerStyles(documentValue);
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-region-banner';
		this.root.setAttribute('aria-live', 'polite');
		documentValue.body.append(this.root);
		this.unsubscribe = runtime.bus.on('world:region-changed', event => this.show(event));
		this.show(runtime.regions?.snapshot?.() || {}, true);
	}

	show(receipt = {}, immediate = false) {
		this.clearTimer();
		this.root.dataset.open = 'true';
		this.root.dataset.safe = String(receipt.safe === true);
		this.root.replaceChildren(
			textNode(this.documentValue, 'span', receipt.icon || '🌿'),
			contentNode(this.documentValue, receipt)
		);
		this.shown += 1;
		this.timer = this.environment.setTimeout?.(() => {
			this.root.dataset.open = 'false';
		}, immediate ? 1800 : DISPLAY_MILLISECONDS);
		return receipt;
	}

	clearTimer() {
		if (this.timer != null) this.environment.clearTimeout?.(this.timer);
		this.timer = null;
	}

	diagnostics() {
		return {
			open: this.root.dataset.open === 'true',
			region: this.runtime.regions?.snapshot?.() || null,
			shown: this.shown
		};
	}

	destroy() {
		this.unsubscribe?.();
		this.clearTimer();
		this.root.remove();
	}
}

function contentNode(documentValue, receipt) {
	const container = documentValue.createElement('div');
	container.append(
		textNode(documentValue, 'strong', receipt.name || 'Open Meadow'),
		textNode(
			documentValue,
			'small',
			receipt.safe ? `Safe haven · ${receipt.ambient || ''}` : receipt.ambient || ''
		)
	);
	return container;
}

function textNode(documentValue, tagName, value) {
	const node = documentValue.createElement(tagName);
	node.textContent = String(value ?? '');
	return node;
}
