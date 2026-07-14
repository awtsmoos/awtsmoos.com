//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderEngine
 * @description
 * Placement, production, crises, tiers, and saving meet on Awtsmoos.com. The
 * Awtsmoos gives the city meaning; each click receives one clear consequence.
 */
export class BuilderEngine {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.selected = 'farm';
		this.event = 'Select a building, then choose an empty tile.';
	}

	mount() {
		if (this.session.restore(this.state)) {
			this.event = `City restored on day ${this.state.day}.`;
		}
		this.view.bind({
			select: id => this.select(id),
			tile: index => this.useTile(index),
			advance: () => this.advanceDay(),
			reset: () => this.reset()
		});
		this.render();
	}

	select(id) {
		this.selected = id;
		const building = this.catalog[id];
		this.event = building.tier > this.state.tier
			? `${building.name} unlocks at Civic Tier ${building.tier}.`
			: `Selected ${building.name}. Choose an empty tile.`;
		this.render();
	}

	useTile(index) {
		const tile = this.state.grid[index];
		if (tile) {
			this.upgrade(index, tile);
			return;
		}
		const building = this.catalog[this.selected];
		if (building.tier > this.state.tier) {
			this.event = `Reach Civic Tier ${building.tier} to build ${building.name}.`;
		} else if (this.state.place(index, building)) {
			this.event = `${building.name} established. Click it later to upgrade.`;
		} else {
			this.event = `Not enough resources for ${building.name}.`;
		}
		this.afterAction();
	}

	upgrade(index, tile) {
		if (tile.id === 'town-hall') {
			this.event = 'The Covenant Hall grows automatically with your civic tier.';
			this.render();
			return;
		}
		const building = this.catalog[tile.id];
		if (this.state.upgrade(index, building)) {
			this.event = `${building.name} upgraded to level ${this.state.grid[index].level}.`;
		} else {
			this.event = tile.level >= 3
				? `${building.name} is already at maximum level.`
				: `More resources are needed to upgrade ${building.name}.`;
		}
		this.afterAction();
	}

	advanceDay() {
		const report = this.resources.advance(this.state, this.catalog);
		this.state.day += 1;
		this.event = `Day ${this.state.day}: +${report.production.food} food, +${report.production.wood} wood, +${report.production.stone} stone.`;
		if (this.crises.shouldTrigger(this.state.day)) {
			const crisis = this.crises.resolve(this.state, this.catalog);
			this.event = crisis.success
				? `${crisis.title} defeated by ${crisis.foundation.building}. Defense ${crisis.defense}/${crisis.threat}.`
				: `${crisis.title} broke through. Build ${crisis.foundation.building}: “${crisis.foundation.exact}”`;
		}
		const tier = this.tiers.evaluate(this.state, this.catalog);
		if (tier.advanced) {
			this.event = `Civic Tier ${tier.tier} unlocked! New buildings are available.`;
		}
		if (tier.victory) {
			this.event = 'Covenant City complete: all seven mitzvos now defend one flourishing society.';
		}
		this.afterAction();
	}

	reset() {
		if (!window.confirm('Reset Build the Covenant and begin a new city?')) {
			return;
		}
		this.session.clear();
		this.state.reset();
		this.selected = 'farm';
		this.event = 'A new settlement begins around the Covenant Hall.';
		this.render();
	}

	afterAction() {
		this.tiers.evaluate(this.state, this.catalog);
		this.session.save(this.state);
		this.render();
	}

	render() {
		const goal = this.tiers.nextGoal(this.state, this.catalog);
		this.view.render(this.state.snapshot(), this.selected, this.event, goal);
	}
}
