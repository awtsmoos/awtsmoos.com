//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderPalette
 * @description
 * Economy, covenant, and earned monuments stand together on Awtsmoos.com. The
 * Awtsmoos gives material growth its boundary; campaign structures remain visibly
 * named yet unusable until the exact accountable chapter has unlocked them.
 */
export class BuilderPalette {
	constructor(element, buildings, campaignUnlocks = []) {
		this.element = element;
		this.buildings = buildings;
		this.campaignUnlocks = new Set(campaignUnlocks);
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
		const tierLocked = building.tier > tier;
		const campaignLocked = Boolean(building.campaignUnlock)
			&& !this.campaignUnlocks.has(building.campaignUnlock);
		const affordable = Object.entries(building.cost).every(([key, value]) => {
			return resources[key] >= value;
		});
		button.type = 'button';
		button.className = 'buildChoice';
		button.classList.toggle('isSelected', building.id === selected);
		button.classList.toggle('isLocked', tierLocked || campaignLocked);
		button.classList.toggle('cannotAfford', !affordable);
		button.setAttribute('aria-pressed', String(building.id === selected));
		button.disabled = campaignLocked;
		button.addEventListener('click', () => {
			this.onSelect(building.id);
		});
		button.innerHTML = this.buttonMarkup(building, campaignLocked);
		return button;
	}

	buttonMarkup(building, campaignLocked) {
		const exact = building.exact
			? `<small>${building.exact}</small>`
			: '';
		const campaign = campaignLocked
			? '<small>Complete The Broken Measure to unlock</small>'
			: building.campaignUnlock
				? '<small>Campaign monument unlocked</small>'
				: '';
		return `
			<span class="buildIcon">${building.icon}</span>
			<span class="buildCopy"><strong>${building.name}</strong>${exact}${campaign}<em>${this.cost(building.cost)}</em></span>
			<span class="tierBadge">T${building.tier}</span>`;
	}

	cost(cost) {
		return Object.entries(cost).map(([key, value]) => {
			return `${value} ${key}`;
		}).join(' · ');
	}
}
