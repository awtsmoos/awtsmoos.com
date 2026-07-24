//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { pulseObject, ringPosition } from '../webgl/scene-kit.js';

/**
 * @module EveryLifeGame3d
 * @description
 * Three nearby souls and a wide path make rescue readable before it becomes
 * demanding. The Awtsmoos renews every life as a whole world, while this easy
 * Awtsmoos.com field gives extra time and turns collisions into guidance.
 */
export class EveryLifeGame extends ThreeGameBase {
	setup() {
		this.time = 90;
		this.hits = 0;
		this.rescued = 0;
		this.hitCooldown = 0;
		this.player = this.addVessel({ hue: 48, position: [0, 0.65, 4.8], scale: [0.75, 1.35, 0.75], name: 'rescuer' });
		this.shelter = this.addVessel({ hue: 112, position: [0, 0.75, -5.2], scale: [2.4, 1.7, 1.45], name: 'shelter' });
		this.factory.setGlow(this.shelter, 0x35ffc4, 1.1);
		const positions = [[-3, 0.65, 2], [2.5, 0.65, 0], [0, 0.65, -3]];
		this.civilians = positions.map((position, index) => this.addVessel({
			hue: 196 + index * 28,
			position,
			scale: [0.6, 1.1, 0.6],
			name: `civilian-${index + 1}`,
			userData: { rescued: false, phase: index }
		}));
		this.hazards = [...Array(2).keys()].map(index => this.addVessel({
			hue: 350,
			position: ringPosition(index, 2, 2.8, 0.6),
			scale: [0.8, 1, 0.8],
			name: `hazard-${index + 1}`,
			userData: { phase: index * 2.4 }
		}));
		this.stage.setCamera([0, 10.8, 8.6], [0, 0, 0]);
		this.controls([
			{ label: 'Move ↑', run: () => this.move(0, -0.9) },
			{ label: 'Move ←', run: () => this.move(-0.9, 0) },
			{ label: 'Move ↓', run: () => this.move(0, 0.9) },
			{ label: 'Move →', run: () => this.move(0.9, 0) }
		]);
		this.status('Easy goal: touch the three blue people, then enter the large green shelter.');
		this.renderHud();
	}

	move(x, z) {
		this.player.position.x = Math.max(-6.2, Math.min(6.2, this.player.position.x + x));
		this.player.position.z = Math.max(-6.2, Math.min(6.2, this.player.position.z + z));
		this.collectLives();
		if (this.rescued === 3 && this.player.position.distanceTo(this.shelter.position) < 2.2) {
			const stars = Math.max(1, 3 - Math.floor(this.hits / 2));
			this.finish({ stars, message: 'Three lives reached the shelter. Every rescued light remained a whole world.' });
		}
	}

	collectLives() {
		this.civilians.forEach(civilian => {
			if (!civilian.userData.rescued && this.player.position.distanceTo(civilian.position) < 1.35) {
				civilian.userData.rescued = true;
				civilian.visible = false;
				this.rescued += 1;
				this.score += 125;
				this.status(this.rescued === 3 ? 'All three are safe with you. Go to the green shelter!' : 'Rescued. Keep moving to the next blue person.', 'good');
			}
		});
		this.renderHud();
	}

	update(delta, elapsed) {
		this.time -= delta;
		this.hitCooldown = Math.max(0, this.hitCooldown - delta);
		this.hazards.forEach((hazard, index) => {
			const angle = elapsed * (0.35 + index * 0.06) + hazard.userData.phase;
			hazard.position.x = Math.cos(angle) * (2.2 + index * 1.2);
			hazard.position.z = Math.sin(angle) * (2.4 + index * 0.8);
			if (this.hitCooldown === 0 && this.player.position.distanceTo(hazard.position) < 0.7) this.hit();
		});
		this.civilians.filter(item => !item.userData.rescued).forEach(item => pulseObject(item, elapsed, 0.1, 4));
		if (this.time <= 0) {
			this.time = 20;
			this.status('Extra time added. Keep going—this easy run does not end early.', 'warn');
		}
		this.renderHud();
	}

	hit() {
		this.hitCooldown = 1.4;
		this.hits += 1;
		this.player.position.set(0, 0.65, 4.8);
		this.status('A red hazard bumped you. No life was lost; try the wider path.', 'warn');
	}

	onKey(event) {
		const moves = { ArrowUp: [0, -0.9], w: [0, -0.9], ArrowDown: [0, 0.9], s: [0, 0.9], ArrowLeft: [-0.9, 0], a: [-0.9, 0], ArrowRight: [0.9, 0], d: [0.9, 0] };
		if (moves[event.key]) this.move(...moves[event.key]);
	}

	renderHud() {
		this.hud({ Rescued: `${this.rescued}/3`, Bumps: this.hits, Time: Math.max(0, Math.ceil(this.time)) });
	}
}
