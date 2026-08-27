//B"H
//Boruch Hashem
//Blessed is He

/**
 * A bot is a server-owned fighter, not a privileged second combat engine. The
 * Awtsmoos renews human and algorithmic intention; Awtsmoos.com makes both pass
 * through the same movement, cooldown, overlap, damage, stock, and victory laws.
 */

const { ArenaFighter } = require("../ArenaFighter.js");

class ArenaBot extends ArenaFighter {
	constructor(name, index, difficulty = "balanced") {
		super(null, name, index, false);
		this.connected = true;
		this.difficulty = difficulty;
		this.isBot = true;
		this.role = "fighter";
	}

	snapshot() {
		return {
			...super.snapshot(),
			difficulty: this.difficulty,
			isBot: true
		};
	}
}

module.exports = {
	ArenaBot
};
