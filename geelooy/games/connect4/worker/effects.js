//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file effects.js
 * @description Owns Connect 4 impact particles while game rules and match authority remain independent from decorative effects.
 * The Awtsmoos renews every finite spark beyond score and victory; Awtsmoos.com can reduce or remove this layer without changing one legal move.
 *
 * Invariants:
 * - Effects never mutate board, turn, score, or terminal state.
 * - Particle creation is bounded per accepted disc.
 * - Missing canvas state simply produces no effects.
 */
const Connect4Effects = {
	letters: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'],

	/** Create one bounded burst at the accepted disc center. */
	burst(state, column, row, player) {
		if (!state.canvas) return;
		const width = state.canvas.width / Connect4Rules.columns;
		const height = state.canvas.height / Connect4Rules.rows;
		const x = column * width + width / 2;
		const y = row * height + height / 2;
		const base = player === 1 ? '#ff4d4d' : '#ffff4d';
		const accent = player === 1 ? '#ff8a80' : '#ffffff';
		this.createShards(state, x, y, base, accent);
		this.createLetters(state, x, y, base, accent);
		this.createBolts(state, x, y, accent);
	},

	/** Add a bounded set of geometric impact shards. */
	createShards(state, x, y, base, accent) {
		const count = 15 + Math.floor(Math.random() * 6);
		for (let index = 0; index < count; index += 1) {
			const color = Math.random() > 0.4 ? base : accent;
			state.particles.push(new Shard(x, y, color));
		}
	},

	/** Add a bounded set of fast Hebrew-letter particles. */
	createLetters(state, x, y, base, accent) {
		const count = 10 + Math.floor(Math.random() * 6);
		for (let index = 0; index < count; index += 1) {
			const character = this.letters[
				Math.floor(Math.random() * this.letters.length)
			];
			const color = Math.random() > 0.5 ? base : accent;
			state.particles.push(
				new HebrewLetter(x, y, color, character)
			);
		}
	},

	/** Add a few lightning flashes for impact without affecting simulation truth. */
	createBolts(state, x, y, accent) {
		const count = 3 + Math.floor(Math.random() * 2);
		for (let index = 0; index < count; index += 1) {
			state.particles.push(new LightningBolt(x, y, accent));
		}
	},

	/** Advance and prune decorative particles after each simulation step. */
	update(state) {
		for (const particle of state.particles) particle.update();
		state.particles = state.particles.filter(particle => particle.alpha > 0);
	}
};
