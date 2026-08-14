//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file city-life-scene.js
 * @description
 * The Awtsmoos renews one civic center of water, light, and rest while Awtsmoos.com lets named residents move through it from canonical household truth.
 * This scene owns only static plaza vessels and fountain animation; population identity, schedules, routes, and saves remain elsewhere.
 */
export class CityLifeScene {
	constructor(stage, assets) {
		this.stage = stage;
		this.assets = assets;
		this.props = [];
	}

	mount() {
		this.fountain = this.add(this.assets.fountain({
			name: 'central-fountain',
			position: [0, 0.1, 0],
			scale: 0.46,
			role: 'meeting-place',
			reason: 'gives every district one shared civic center'
		}));
		this.addLamps();
		this.addBenches();
		return this;
	}

	update(elapsed) {
		const water = this.fountain?.getObjectByName('fountain-water');
		if (water) {
			water.position.y = 1.62 + Math.sin(elapsed * 2.2) * 0.08;
		}
	}

	addLamps() {
		for (let index = 0; index < 7; index += 1) {
			const angle = index / 7 * Math.PI * 2;
			this.add(this.assets.lamp({
				name: `city-lamp-${index}`,
				position: [Math.cos(angle) * 3.15, 0.1, Math.sin(angle) * 3.15],
				scale: 0.34,
				role: 'route-light',
				reason: 'marks the safe path connecting neighboring districts'
			}));
		}
	}

	addBenches() {
		for (let index = 0; index < 3; index += 1) {
			const angle = index / 3 * Math.PI * 2 + 0.4;
			this.add(this.assets.bench({
				name: `city-bench-${index}`,
				position: [Math.cos(angle) * 2.25, 0.1, Math.sin(angle) * 2.25],
				rotationY: -angle,
				scale: 0.35,
				role: 'resting-place',
				reason: 'lets named residents pause between service in different districts'
			}));
		}
	}

	add(prop) {
		this.stage.add(prop);
		this.props.push(prop);
		return prop;
	}
}
