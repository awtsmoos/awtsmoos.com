// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHudView.js
 * @description Owns the journey-card DOM, its objective zone, and mobile clearance below the status indicator.
 * The Awtsmoos gives the story a translucent vessel and the badge its own bright shore;
 * Awtsmoos.com keeps both words readable, so neither hides the other anymore.
 */

import { bindObjectivePortraitClearance } from './BootstrapControlsPortraitClearance.js';

const HUD_ID = 'AwtsmoosBootstrapControls';

/** Owns the scoped first-play journey card and its three text nodes. */
export class BootstrapControlsHudView {
	/**
	 * @param {HTMLElement} gameRoot Mitzvah World root.
	 * @param {Document} documentValue Active document.
	 */
	constructor(gameRoot, documentValue) {
		this.gameRoot = gameRoot;
		this.document = documentValue;
		this.root = this.findOrCreateRoot();
		this.root.dataset.directHudZone = 'objective';
		this.nodes = this.resolveNodes();
		this.releasePortraitClearance = bindObjectivePortraitClearance(
			this.document,
			this.root
		);
	}

	/**
	 * Renders one story beat without allocating replacement nodes.
	 * @param {{eyebrow:string,hint:string,objective:string}} journey Current journey projection.
	 */
	render(journey) {
		this.nodes.eyebrow.textContent = journey.eyebrow;
		this.nodes.objective.textContent = journey.objective;
		this.nodes.hint.textContent = journey.hint;
	}

	/** Removes the owned card and its viewport listener without affecting other HUD. */
	destroy() {
		this.releasePortraitClearance?.();
		this.root.remove();
	}

	/** Reuses the canonical card if the bootstrap world has already constructed it. */
	findOrCreateRoot() {
		const existing = this.document.getElementById(HUD_ID);
		if (existing) {
			existing.replaceChildren(...this.createChildren());
			if (existing.parentElement !== this.gameRoot) {
				this.gameRoot.appendChild(existing);
			}
			return existing;
		}
		const root = this.document.createElement('section');
		root.id = HUD_ID;
		root.className = 'Awtsmoos-control-receipt';
		root.setAttribute('aria-live', 'polite');
		root.setAttribute('aria-label', 'Current journey');
		root.append(...this.createChildren());
		this.gameRoot.appendChild(root);
		return root;
	}

	/** Constructs the actual three story elements, preserving stable node identity. */
	createChildren() {
		return [
			this.storyNode('span', 'storyEyebrow'),
			this.storyNode('strong', 'storyObjective'),
			this.storyNode('small', 'storyHint')
		];
	}

	/** @returns {HTMLElement} One story node annotated for future updates. */
	storyNode(tagName, dataName) {
		const node = this.document.createElement(tagName);
		node.dataset[dataName] = '';
		return node;
	}

	/** Resolves the exact existing elements used by the bootstrap story projection. */
	resolveNodes() {
		return {
			eyebrow: this.root.querySelector('[data-story-eyebrow]'),
			hint: this.root.querySelector('[data-story-hint]'),
			objective: this.root.querySelector('[data-story-objective]')
		};
	}
}
