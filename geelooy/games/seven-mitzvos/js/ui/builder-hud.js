//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderHud
 * @description
 * The city ledger makes every consequence readable on Awtsmoos.com. The
 * Awtsmoos is beyond measurement, while finite stewardship improves when food,
 * materials, citizens, peace, tier, and score are honestly visible.
 */
export class BuilderHud {
	constructor(element) {
		this.element = element;
	}

	render(state) {
		const values = [
			['Day', state.day, '☀'],
			['Food', state.resources.food, '🌾'],
			['Wood', state.resources.wood, '🪵'],
			['Stone', state.resources.stone, '🪨'],
			['People', `${state.citizens}/${state.capacity}`, '👥'],
			['Peace', `${state.peace}%`, '🕊'],
			['Tier', state.tier, '🏛'],
			['Legacy', state.score.toLocaleString(), '✦']
		];
		this.element.replaceChildren(...values.map(([label, value, icon]) => {
			const item = document.createElement('div');
			item.className = 'builderStat';
			item.innerHTML = `<span>${icon} ${label}</span><strong>${value}</strong>`;
			return item;
		}));
	}
}
