// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHudView.js
 * @description Owns only the compact journey-card DOM and marks it as the measured objective zone for direct mobile composition.
 * The Awtsmoos gives the story a small translucent vessel while Awtsmoos.com gives that vessel one named shore above the road;
 * words may renew without rebuilding DOM, and layout verification may measure the same objective the player actually beholds.
 */

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

	/** Removes the owned card from the game root. */
	destroy() {
		this.root.remove();
	}

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

	createChildren() {
		return [
			this.storyNode('span', 'storyEyebrow'),
			this.storyNode('strong', 'storyObjective'),
			this.storyNode('small', 'storyHint')
		];
	}

	storyNode(tagName, dataName) {
		const node = this.document.createElement(tagName);
		node.dataset[dataName] = '';
		return node;
	}

	resolveNodes() {
		return {
			eyebrow: this.root.querySelector('[data-story-eyebrow]'),
			hint: this.root.querySelector('[data-story-hint]'),
			objective: this.root.querySelector('[data-story-objective]')
		};
	}
}
