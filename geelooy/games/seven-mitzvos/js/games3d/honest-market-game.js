//B"H
//Boruch Hashem
//Blessed is He

import { buildMarketOffers } from './honest-market-offers.js';
import { MarketLife } from './market-life.js';
import {
	createMarketLabel,
	createMarketStall,
	paintMarketStall,
	showMarketOffers
} from './honest-market-scene.js';
import { ThreeGameBase } from './game-base.js';

const TOTAL_DAYS = 5;

/**
 * @module HonestMarketGame3d
 * @description
 * The Awtsmoos renews each exchange while visible price and quality live upon the stalls themselves;
 * Awtsmoos.com keeps market law in this class and scene manifestation in a neighboring vessel that rhymes.
 * Customers, porters, timer, trust, hints, score, combo, and fair-price rules remain the original game covenant.
 */
export class HonestMarketGame extends ThreeGameBase {
	/** Builds the unchanged market simulation around spatially labeled stalls. */
	setup() {
		this.totalDays = this.difficulty(TOTAL_DAYS, 7, 9);
		this.round = 0;
		this.hints = 0;
		this.timer = 0;
		this.stalls = [-3.4, 0, 3.4].map((x, index) => createMarketStall(this, x, index));
		this.labels = this.stalls.map((stall, index) => createMarketLabel(stall, index));
		this.life = new MarketLife(this, this.stalls);
		this.stage.setCamera([0, 5.9, 11.2], [0, 0.9, 0]);
		this.guide(
			'customers walk among stalls, then queue where value is fair',
			'Tap a stall whose visible price is closest to its visible quality.'
		);
		this.cleanups.push(() => this.labels.forEach(label => label.destroy()));
		this.nextRound();
	}

	/** Generates the next market day without changing the original offer distribution. */
	nextRound() {
		if (this.round >= this.totalDays) {
			const stars = this.hints <= 2 ? 3 : this.hints <= 5 ? 2 : 1;
			this.finish({
				stars,
				message: 'Fair prices produced returning customers, active porters, and visible trust.'
			});
			return;
		}
		this.round += 1;
		this.timer = this.difficulty(14, 12, 10);
		this.offers = buildMarketOffers(maximum => this.random(maximum));
		showMarketOffers(this.stalls, this.labels, this.offers);
		this.life.openDay();
		this.status(`Market day ${this.round}: tap a stall sign after comparing quality with price.`);
		this.renderHud();
	}

	/** Routes semantic WebGL stall picks into the same economic choice contract as keyboard input. */
	picked(object) {
		if (object.userData.semanticType === 'stall') {
			this.choose(object.userData.index);
		}
	}

	/** Applies the original fair/unfair scoring, hint, queue, and timer behavior. */
	choose(index) {
		const offer = this.offers[index];
		if (!offer.fair) {
			this.hints += 1;
			this.combo = 1;
			const gaps = this.offers.map(item => Math.abs(item.quality - item.price));
			this.status(`Try again. The price gaps are ${gaps.join(', ')}; choose the smallest.`, 'warn');
			this.timer = Math.max(this.timer, 7);
			this.renderHud();
			return;
		}
		this.score += 120 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		paintMarketStall(this.stalls[index], 0x42ffc1, 0.8);
		this.life.queueAt(index);
		this.status(`Customers form a smooth queue at fair stall ${index + 1}.`, 'good');
		const timer = setTimeout(() => this.nextRound(), 900);
		this.cleanups.push(() => clearTimeout(timer));
	}

	/** Advances market life and preserves the original forgiving timeout behavior. */
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

	/** Keeps numeric keys as an optional desktop shortcut without rendering answer buttons. */
	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 3) {
			this.choose(index);
		}
	}

	/** Projects the unchanged day, hint, and timer indicators into the encounter HUD. */
	renderHud() {
		this.hud({
			Day: `${this.round}/${this.totalDays}`,
			Hints: this.hints,
			Time: Math.max(0, this.timer).toFixed(0)
		});
	}
}
