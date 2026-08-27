//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class BinahInteractionDisclosure
 * @description
 * The Awtsmoos keeps exact coordinates available while Awtsmoos.com reveals them only when intention needs precision;
 * ordinary writing stays calm, while Heichel, Series, entity, verse, and reply coordinates remain one click within.
 */
export class BinahInteractionDisclosure {
	constructor(root = document) {
		this.root = root;
	}

	mount() {
		const panel = this.root.querySelector('[data-panel="interact"]');
		const grid = panel?.querySelector('.targetGrid');
		if (!panel || !grid || grid.closest('.futureCoordinates')) {
			return null;
		}
		const details = this.root.createElement('details');
		details.className = 'futureCoordinates';
		details.open = this.hasExplicitCoordinates(grid);
		const summary = this.root.createElement('summary');
		summary.className = 'futureCoordinates__summary';
		const title = this.root.createElement('strong');
		title.textContent = 'Advanced coordinates';
		const copy = this.root.createElement('span');
		copy.textContent = 'Heichel · Series · entity · verse · reply target';
		summary.append(title, copy);
		grid.before(details);
		details.append(summary, grid);
		return details;
	}

	hasExplicitCoordinates(grid) {
		const controls = [...grid.querySelectorAll('input, select, textarea')];
		return controls.some(control => {
			const value = String(control.value || '').trim();
			return value && value !== 'root' && value !== 'post';
		});
	}
}
