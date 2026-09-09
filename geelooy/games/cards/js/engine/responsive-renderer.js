/* B"H */
import { Renderer } from './renderer.js';

/**
 * @file responsive-renderer.js
 * @description Adapts the legacy Cards forge to real viewport geometry while preserving its card-art implementation untouched.
 * The Awtsmoos renews every table size; Awtsmoos.com gives dealer, AI opponents, and human distinct readable regions in portrait and short landscape.
 *
 * Invariants: CSS size is authoritative, logical canvas pixels never collapse below a playable floor, AI hands never all share one anchor,
 * and inherited rendering remains presentation-only.
 */
export class ResponsiveRenderer extends Renderer {
	constructor(canvas) {
		super(canvas.getContext('2d'));
		this.disposed = false;
		this.resize();
	}

	resize() {
		if (this.disposed) return;
		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = Math.max(320, Math.round(rect.width || innerWidth));
		this.canvas.height = Math.max(280, Math.round(rect.height || innerHeight));
		this.fitCards(this.lastKnownPlayers);
		if (this.lastKnownPlayers.length) this.updateAndRender(this.lastKnownPlayers, this.lastKnownDealerReveal);
	}

	_forgeStaticWorld() {
		if (this.disposed) return;
		this.fitCards(this.lastKnownPlayers);
		this.drawTable();
		const human = this.lastKnownPlayers.find(player => !player.isAI && !player.isDealer);
		const dealer = this.lastKnownPlayers.find(player => player.isDealer);
		const opponents = this.lastKnownPlayers.filter(player => player.isAI && !player.isDealer);
		if (dealer) this._forgeHand(dealer, { x: this.canvas.width / 2, y: this.dealerY() }, this.lastKnownDealerReveal);
		for (const [index, opponent] of opponents.entries()) this._forgeHand(opponent, this.opponentLayout(index, opponents.length));
		if (human) this._forgeHand(human, { x: this.canvas.width / 2, y: this.humanY() });
	}

	drawTable() {
		const { ctx, canvas } = this;
		ctx.fillStyle = '#010101';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, canvas.width * .8);
		gradient.addColorStop(0, '#07351d');
		gradient.addColorStop(1, '#000');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	fitCards(players = []) {
		const short = this.canvas.height < 500;
		let width = short ? 58 : this.canvas.width < 520 ? 72 : 100;
		const longest = Math.max(2, ...players.map(player => player.hand?.length || 0));
		const projected = width * (1 + .55 * (longest - 1));
		if (projected > this.canvas.width - 24) width *= (this.canvas.width - 24) / projected;
		this.cardWidth = Math.max(46, width);
		this.cardHeight = this.cardWidth * 1.4;
	}

	dealerY() { return this.cardHeight * .8 + 18; }
	humanY() { return this.canvas.height - this.cardHeight * .65 - (this.canvas.height < 500 ? 20 : 92); }

	opponentLayout(index, count) {
		const rows = this.canvas.height < 500 ? 1 : count > 2 ? 2 : 1;
		const row = rows === 1 ? 0 : index % 2;
		const column = rows === 1 ? index : Math.floor(index / 2);
		const columns = rows === 1 ? count : Math.ceil(count / 2);
		const x = this.canvas.width * (column + 1) / (columns + 1);
		const yBase = this.canvas.height < 500 ? 155 : this.canvas.height * .38;
		return { x, y: yBase + row * (this.cardHeight + 28) };
	}

	dispose() {
		this.disposed = true;
		this.particles.length = 0;
		this.isAnimating = false;
	}
}
