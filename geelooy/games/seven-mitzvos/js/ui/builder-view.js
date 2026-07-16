//B"H
//Boruch Hashem
//Blessed is He

import { builderTemplate } from './builder-template.js';
import { BuilderGrid } from './builder-grid.js';
import { BuilderPalette } from './builder-palette.js';
import { FoundationLedger } from './foundation-ledger.js';
import { BuilderHud } from './builder-hud.js';

/**
 * @module BuilderView
 * @description
 * City, economy, exact mitzvos, and earned monument gather on Awtsmoos.com. The
 * Awtsmoos gives every layer one purpose, so this view preserves construction,
 * defense, learning, and visible campaign unlock state without merging their logic.
 */
export class BuilderView {
	constructor(mount, launch, buildings, catalog, foundations, campaignUnlocks = []) {
		mount.innerHTML = builderTemplate();
		this.section = mount.querySelector('#builderSection');
		this.launch = launch;
		this.event = mount.querySelector('#builderEvent');
		this.goal = mount.querySelector('#builderGoal');
		this.advance = mount.querySelector('#advanceDay');
		this.reset = mount.querySelector('#resetCity');
		this.grid = new BuilderGrid(mount.querySelector('#builderGrid'), catalog);
		this.palette = new BuilderPalette(
			mount.querySelector('#builderPalette'),
			buildings,
			campaignUnlocks
		);
		this.ledger = new FoundationLedger(
			mount.querySelector('#foundationLedger'),
			foundations
		);
		this.hud = new BuilderHud(mount.querySelector('#builderHud'));
		this.catalog = catalog;
	}

	bind(actions) {
		this.launch.addEventListener('click', () => {
			this.section.scrollIntoView({
				behavior: this.motionBehavior(),
				block: 'start'
			});
		});
		this.advance.addEventListener('click', actions.advance);
		this.reset.addEventListener('click', actions.reset);
		this.grid.bind(actions.tile);
		this.palette.bind(actions.select);
	}

	render(state, selected, event, goal) {
		this.hud.render(state);
		this.grid.render(state.grid, selected);
		this.palette.render(state.tier, selected, state.resources);
		this.ledger.render(this.foundationLevels(state.grid));
		this.event.textContent = event;
		this.goal.textContent = goal;
		this.section.classList.toggle('hasVictory', state.victory);
		this.flashEvent();
	}

	foundationLevels(grid) {
		const levels = {};
		for (const tile of grid) {
			const foundation = tile && this.catalog[tile.id]?.foundation;
			if (foundation) {
				levels[foundation] = (levels[foundation] || 0) + tile.level;
			}
		}
		return levels;
	}

	flashEvent() {
		this.event.classList.remove('isFresh');
		void this.event.offsetWidth;
		this.event.classList.add('isFresh');
	}

	motionBehavior() {
		return matchMedia('(prefers-reduced-motion: reduce)').matches
			? 'auto'
			: 'smooth';
	}
}
