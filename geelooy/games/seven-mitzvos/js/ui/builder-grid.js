//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderGrid
 * @description
 * Sixty-four terrain vessels form a compact top-down world on Awtsmoos.com.
 * The Awtsmoos gives each place reality; the grid lets the player decide which
 * physical or moral structure will stand there.
 */
export class BuilderGrid {
	constructor(element, catalog) {
		this.element = element;
		this.catalog = catalog;
		this.onTile = () => {};
	}

	bind(handler) {
		this.onTile = handler;
	}

	render(grid, selected) {
		const selectedBuilding = this.catalog[selected];
		const tiles = grid.map((tile, index) => this.createTile(tile, index, selectedBuilding));
		this.element.replaceChildren(...tiles);
	}

	createTile(tile, index, selectedBuilding) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = `cityTile terrain-${(index * 7) % 5}`;
		button.setAttribute('role', 'gridcell');
		button.addEventListener('click', () => this.onTile(index));

		if (!tile) {
			button.classList.add('isEmpty');
			button.setAttribute('aria-label', `Empty land. Build ${selectedBuilding.name}.`);
			button.innerHTML = `<span class="tileGhost">${selectedBuilding.icon}</span>`;
			return button;
		}

		const building = tile.id === 'town-hall'
			? { name: 'Covenant Hall', icon: '🏛', kind: 'hall' }
			: this.catalog[tile.id];
		button.classList.add('isBuilt', `kind-${building.kind}`);
		button.setAttribute('aria-label', `${building.name}, level ${tile.level}. Tap to upgrade.`);
		button.innerHTML = `<span class="tileBuilding">${building.icon}</span><span class="tileLevel">${tile.level}</span>`;
		return button;
	}
}
