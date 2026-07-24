//B"H
//Boruch Hashem
//Blessed is He
import { MarketLife } from './market-life.js';
import { ThreeGameBase } from './game-base.js';
const TOTAL_DAYS = 5;
/**
 * @module HonestMarketGame3d
 * @description
 * Merchants serve, porters deliver, and customers physically queue at the fair
 * stall. The Awtsmoos renews every exchange; Awtsmoos.com makes visible value
 * produce visible trust while preserving a fast adaptive market population.
 */
export class HonestMarketGame extends ThreeGameBase {
	setup() {
		this.totalDays = this.difficulty(TOTAL_DAYS, 7, 9);
		this.round = 0;
		this.hints = 0;
		this.timer = 0;
		this.stalls = [-3.4, 0, 3.4].map((x, index) => this.createStall(x, index));
		this.life = new MarketLife(this, this.stalls);
		this.stage.setCamera([0, 5.9, 11.2], [0, 0.9, 0]);
		this.guide('customers walk among stalls, then queue where value is fair', 'Choose the stall where price is closest to quality.');
		this.nextRound();
	}
	createStall(x, index) {
		const stall = this.assets.stall({
			name: `market-stall-${index + 1}`, hue: this.definition.hue + index * 32,
			position: [x, 0.12, 0], scale: 0.72, type: 'stall', index,
			role: 'trade-stall', reason: `offers visible goods for day-by-day comparison at stall ${index + 1}`
		});
		this.assets.parts.mark(stall, { ...stall.userData, semanticType: 'stall', index });
		return this.addAsset(stall, true);
	}
	nextRound() {
		if (this.round >= this.totalDays) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Fair prices produced returning customers, active porters, and visible trust.' });
			return;
		}
		this.round += 1;
		this.timer = this.difficulty(14, 12, 10);
		const fairIndex = this.random(3);
		this.offers = this.stalls.map((stall, index) => {
			const quality = 3 + this.random(7);
			const price = index === fairIndex ? Math.max(1, quality + this.random(3) - 1) : this.unfairPrice(quality);
			stall.scale.y = 0.92 + quality * 0.018;
			this.paint(stall, 0x000000, 0);
			return { quality, price, fair: index === fairIndex };
		});
		this.controls(this.offers.map((offer, index) => ({
			label: `Stall ${index + 1} · Q${offer.quality} / $${offer.price}`,
			run: () => this.choose(index)
		})));
		this.life.openDay();
		this.status(`Market day ${this.round}: watch customers compare visible quality with price.`);
		this.renderHud();
	}
	unfairPrice(quality) {
		const direction = Math.random() < 0.5 ? -1 : 1;
		return Math.max(1, Math.min(14, quality + direction * (4 + this.random(3))));
	}
	picked(object) {
		if (object.userData.semanticType === 'stall') {
			this.choose(object.userData.index);
		}
	}
	choose(index) {
		const offer = this.offers[index];
		if (!offer.fair) {
			this.hints += 1;
			this.combo = 1;
			const gaps = this.offers.map(item => Math.abs(item.quality - item.price));
			this.status(`Try again. The price gaps are ${gaps.join(', ')}; choose the smallest.`, 'warn');
			this.timer = Math.max(this.timer, 7);
			return this.renderHud();
		}
		this.score += 120 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.paint(this.stalls[index], 0x42ffc1, 0.8);
		this.life.queueAt(index);
		this.status(`Customers form a smooth queue at fair stall ${index + 1}.`, 'good');
		const timer = setTimeout(() => this.nextRound(), 900);
		this.cleanups.push(() => clearTimeout(timer));
	}
	update(delta, elapsed) {
		this.timer -= delta;
		this.life.update(delta, elapsed);
		if (this.timer <= 0) {
			this.timer = 10;
			this.hints += 1;
			this.status('Nechama adds time. Compare quality and price at your pace.', 'warn');
		}
		this.renderHud();
	}
	paint(root, color, intensity) {
		root.traverse(child => {
			if (child.isMesh && child.material.emissive) {
				child.material.emissive.setHex(color);
				child.material.emissiveIntensity = intensity;
			}
		});
	}
	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 3) {
			this.choose(index);
		}
	}
	renderHud() {
		this.hud({ Day: `${this.round}/${this.totalDays}`, Hints: this.hints, Time: Math.max(0, this.timer).toFixed(0) });
	}
}
