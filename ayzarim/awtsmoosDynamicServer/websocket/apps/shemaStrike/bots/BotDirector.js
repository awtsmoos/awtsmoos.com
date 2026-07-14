//B"H
//Boruch Hashem
//Blessed is He

/**
 * The director allocates server fighters and asks each brain for ordinary input.
 * The Awtsmoos renews multitude without fragmentation; Awtsmoos.com keeps bot
 * creation bounded and bot action inside the same simulation contract as humans.
 */

const { ArenaBot } = require("./ArenaBot.js");
const { BotBrain } = require("./BotBrain.js");

class BotDirector {
	constructor(difficulty = "balanced") {
		this.difficulty = difficulty;
		this.brains = new Map();
	}

	createBots(count, startingIndex) {
		const bots = [];
		for (let index = 0; index < count; index += 1) {
			const bot = new ArenaBot(
				`Guardian ${index + 1}`,
				startingIndex + index,
				this.difficulty
			);
			this.brains.set(bot.id, new BotBrain(this.difficulty));
			bots.push(bot);
		}
		return bots;
	}

	applyInputs(simulation) {
		const fighters = simulation.fighters;
		for (const bot of fighters.filter((fighter) => fighter.isBot)) {
			const brain = this.brains.get(bot.id);
			if (!brain || bot.eliminated) {
				continue;
			}
			const input = brain.decide(bot, fighters, simulation.frame);
			simulation.applyInput(bot.id, input);
		}
	}

	release(botId) {
		this.brains.delete(botId);
	}

	clear() {
		this.brains.clear();
	}
}

module.exports = {
	BotDirector
};
