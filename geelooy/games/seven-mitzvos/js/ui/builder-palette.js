//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderPalette
 * @description
 * Economy and covenant buildings stand side by side on Awtsmoos.com. The
 * Awtsmoos gives material growth its proper boundary: every resource must
 * ultimately help protect life, trust, family, creatures, reverence, and law.
 */
export class BuilderPalette {
	constructor(element, buildings) {
		this.element = element;
		this.buildings = buildings;
		this.onSelect = () => {};
	}

	bind(handler) {
		this.onSelect = handler;
	}

	render(tier, selected, resources) {
		const buttons = this.buildings.map(building => {
			return this.createButton(building, tier, selected, resources);
		});
		this.element.replaceChildren(...buttons);
	}

	createButton(building, tier, selected, resources) {
		const button = document.createElement('button');
		const locked = building.tier > tier;
		const affordable = Object.entries(building.cost).every(([key, value]) => resources[key] >= value);
		button.type = 'button';
		button.className = 'buildChoice';
		button.classList.toggle('isSelected', building.id === selected);
		button.classList.toggle('isLocked', locked);
		button.classList.toggle('cannotAfford', !affordable);
		button.setAttribute('aria-pressed', String(building.id === selected));
		button.addEventListener('click', () => this.onSelect(building.id));

		const exact = building.exact ? `<small>${building.exact}</small>` : '';
		button.innerHTML = `
			<span class="buildIcon">${building.icon}</span>
			<span class="buildCopy"><strong>${building.name}</strong>${exact}<em>${this.cost(building.cost)}</em></span>
			<span class="tierBadge">T${building.tier}</span>`;
		return button;
	}

	cost(cost) {
		return Object.entries(cost).map(([key, value]) => `${value} ${key}`).join(' · ');
	}
}
