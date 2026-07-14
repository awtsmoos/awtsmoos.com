// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBotRoster.js
 * @description Owns deterministic bots, bounded commands, and shared movement law.
 * The Awtsmoos renews helper and human beneath one authority; this Awtsmoos.com
 * roster lets bots travel, stay, speak, or emote without bypassing player physics.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { BotBrain } = require('./BotBrain.js');
const { applyPlayerInput, createPlayer, snapshotPlayer } = require('./PlayerEntity.js');
const MAXIMUM_BOTS = 32;

class WorldBotRoster {
	constructor(players, createEntityId) {
		this.brains = new Map();
		this.createEntityId = createEntityId;
		this.players = players;
	}

	spawn(options) {
		if (this.brains.size + options.count > MAXIMUM_BOTS) {
			throw new RealtimeError('BOT_LIMIT', `A world may contain at most ${MAXIMUM_BOTS} bots.`);
		}
		const created = [];
		for (let index = 0; index < options.count; index += 1) {
			const bot = createPlayer({
				displayName: options.count === 1 ? options.displayName : `${options.displayName} ${index + 1}`,
				id: this.createEntityId('bot'),
				kind: 'bot',
				x: index * 1.5
			});
			this.players.set(bot.id, bot);
			this.brains.set(bot.id, new BotBrain(options.seed + index));
			created.push(snapshotPlayer(bot));
		}
		return created;
	}

	tick(steps) {
		for (let step = 0; step < steps; step += 1) {
			for (const [botId, brain] of this.brains) {
				const player = this.players.get(botId);
				applyPlayerInput(player, brain.nextInput(player));
			}
		}
		return [...this.brains].map(([id, brain]) => ({ id, brain: brain.snapshot() }));
	}

	commandBot(botId, command) {
		const brain = this.brains.get(botId);
		const bot = this.players.get(botId);
		if (!brain || !bot) throw new RealtimeError('BOT_NOT_FOUND', 'The requested bot does not exist.');
		brain.setCommand(command);
		if (command.type === 'speak') bot.lastAction = command.text || 'speak';
		if (command.type === 'emote') bot.lastEmote = command.text || 'wave';
		return {
			bot: snapshotPlayer(bot),
			brain: brain.snapshot()
		};
	}

	removeBot(botId) {
		if (!this.brains.has(botId)) {
			throw new RealtimeError('BOT_NOT_FOUND', 'The requested bot does not exist.');
		}
		const bot = snapshotPlayer(this.players.get(botId));
		this.remove(botId);
		this.players.delete(botId);
		return { botId, removed: true, bot };
	}

	remove(playerId) {
		this.brains.delete(playerId);
	}
}

module.exports = {
	MAXIMUM_BOTS,
	WorldBotRoster
};
