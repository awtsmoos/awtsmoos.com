//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';

const TOTAL_DAYS = 5;

/**
 * @module HonestMarketGame3d
 * @description
 * Quality and price now appear directly on every choice. The Awtsmoos renews
 * every exchange, while this easy Awtsmoos.com market gives time, comparison,
 * and another try whenever glitter briefly hides honest value.
 */
export class HonestMarketGame extends ThreeGameBase {
	setup() {
		this.round = 0;
		this.timer = 0;
		this.hints = 0;
		this.stalls = [-3.2, 0, 3.2].map((x, index) => this.addVessel({
			hue: this.definition.hue + index * 35,
			position: [x, 0.8, 0],
			scale: [1.7, 1.7, 1.7],
			name: `market-stall-${index + 1}`,
			userData: { type: 'stall', index }
		}, true));
		this.stage.setCamera([0, 5.7, 10.5], [0, 0.8, 0]);
		this.nextRound();
	}

	nextRound() {
		if (this.round >= TOTAL_DAYS) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Five fair exchanges built a market where price and value could meet honestly.' });
			return;
		}
		this.round += 1;
		this.timer = 14;
		const fairIndex = this.random(3);
		this.offers = this.stalls.map((stall, index) => {
			const quality = 3 + this.random(7);
			const price = index === fairIndex ? Math.max(1, quality + this.random(3) - 1) : this.unfairPrice(quality);
			stall.scale.y = 0.9 + price * 0.1;
			this.factory.setHue(stall, 120 + quality * 8, 0.4 + quality * 0.02);
			this.factory.setGlow(stall, 0x000000, 0);
			return { quality, price, fair: index === fairIndex };
		});
		this.controls(this.offers.map((offer, index) => ({
			label: `Stall ${index + 1} · Q${offer.quality} / $${offer.price}`,
			run: () => this.choose(index)
		})));
		this.status(`Day ${this.round}: choose the stall where price is closest to quality.`);
		this.renderHud();
	}

	unfairPrice(quality) {
		const direction = Math.random() < 0.5 ? -1 : 1;
		return Math.max(1, Math.min(14, quality + direction * (4 + this.random(3))));
	}

	picked(object) {
		if (object.userData.type === 'stall') this.choose(object.userData.index);
	}

	choose(index) {
		const offer = this.offers[index];
		if (!offer.fair) {
			this.hints += 1;
			this.combo = 1;
			const gaps = this.offers.map(item => Math.abs(item.quality - item.price));
			this.status(`Try again. Compare the gaps: ${gaps.join(', ')}. Smallest gap wins.`, 'warn');
			this.timer = Math.max(this.timer, 7);
			this.renderHud();
			return;
		}
		this.score += 120 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.factory.setGlow(this.stalls[index], 0x42ffc1, 1.5);
		this.status('Fair value found.', 'good');
		this.nextRound();
	}

	update(delta, elapsed) {
		this.timer -= delta;
		this.stalls.forEach((stall, index) => {
			stall.rotation.y = Math.sin(elapsed * 0.55 + index) * 0.1;
		});
		if (this.timer <= 0) {
			this.timer = 10;
			this.hints += 1;
			this.status('Extra time added. Compare quality and price at your pace.', 'warn');
		}
		this.renderHud();
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 3) this.choose(index);
	}

	renderHud() {
		this.hud({ Day: `${this.round}/${TOTAL_DAYS}`, Hints: this.hints, Time: Math.max(0, this.timer).toFixed(0) });
	}
}
