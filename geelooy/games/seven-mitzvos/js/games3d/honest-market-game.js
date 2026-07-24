//B"H
//Boruch Hashem
//Blessed is He
import { animatePerson } from '../procedural/person-factory.js';
import { ThreeGameBase } from './game-base.js';
const TOTAL_DAYS = 5;
/**
 * @module HonestMarketGame3d
 * @description
 * Three staffed procedural stalls display goods, price, and visible quality. The
 * Awtsmoos renews every exchange; Awtsmoos.com turns fair judgment into loyal
 * customers while preserving a fast low-poly market on phones.
 */
export class HonestMarketGame extends ThreeGameBase {
	setup() {
		this.totalDays = this.difficulty(TOTAL_DAYS, 7, 9);
		this.round = 0;
		this.hints = 0;
		this.timer = 0;
		this.stalls = [-3.4, 0, 3.4].map((x, index) => this.createStall(x, index));
		this.stage.setCamera([0, 5.9, 11.2], [0, 0.9, 0]);
		this.guide('quality and price appear together over each staffed stall', 'Choose the stall where price is closest to quality.');
		this.nextRound();
	}
	createStall(x, index) {
		const stall = this.assets.stall({
			name: `market-stall-${index + 1}`, hue: this.definition.hue + index * 32,
			position: [x, 0.12, 0], scale: 0.72, type: 'stall', index
		});
		this.assets.parts.mark(stall, { semanticType: 'stall', index });
		this.addAsset(stall, true);
		const merchant = this.assets.person({
			name: `merchant-${index + 1}`, personName: `Merchant ${index + 1}`,
			hue: 40 + index * 70, position: [x, 0.12, -1.25], scale: 0.34, phase: index
		});
		this.addAsset(merchant);
		stall.userData.merchant = merchant;
		return stall;
	}
	nextRound() {
		if (this.round >= this.totalDays) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Fair prices filled the market with returning customers and visible trust.' });
			return;
		}
		this.round += 1;
		this.timer = this.difficulty(14, 12, 10);
		const fairIndex = this.random(3);
		this.offers = this.stalls.map((stall, index) => {
			const quality = 3 + this.random(7);
			const price = index === fairIndex ? Math.max(1, quality + this.random(3) - 1) : this.unfairPrice(quality);
			stall.scale.y = 0.92 + quality * 0.018;
			this.paint(stall, index === fairIndex ? 0x000000 : 0x000000, 0);
			return { quality, price, fair: index === fairIndex };
		});
		this.controls(this.offers.map((offer, index) => ({
			label: `Stall ${index + 1} · Q${offer.quality} / $${offer.price}`,
			run: () => this.choose(index)
		})));
		this.status(`Market day ${this.round}: compare visible quality with price.`);
		this.renderHud();
	}
	unfairPrice(quality) {
		const direction = Math.random() < 0.5 ? -1 : 1;
		return Math.max(1, Math.min(14, quality + direction * (4 + this.random(3))));
	}
	picked(object) {
		if (object.userData.semanticType === 'stall') this.choose(object.userData.index);
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
		this.status(`Customers gather at fair stall ${index + 1}.`, 'good');
		this.nextRound();
	}
	update(delta, elapsed) {
		this.timer -= delta;
		this.stalls.forEach(stall => animatePerson(stall.userData.merchant, elapsed, false));
		if (this.timer <= 0) {
			this.timer = 10;
			this.hints += 1;
			this.status('Nechama adds time. Compare quality and price at your pace.', 'warn');
		}
		this.renderHud();
	}
	paint(root, color, intensity) {
		root.traverse(child => {
			if (!child.isMesh || !child.material.emissive) return;
			child.material.emissive.setHex(color);
			child.material.emissiveIntensity = intensity;
		});
	}
	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 3) this.choose(index);
	}
	renderHud() {
		this.hud({ Day: `${this.round}/${this.totalDays}`, Hints: this.hints, Time: Math.max(0, this.timer).toFixed(0) });
	}
}
