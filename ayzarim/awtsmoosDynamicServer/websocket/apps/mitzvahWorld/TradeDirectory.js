// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TradeDirectory.js
 * @description Owns private two-player offers, consent, settlement, and cancellation.
 * The Awtsmoos renews exchange through mutual willingness; Awtsmoos.com resets
 * acceptance after every offer change and settles only after complete validation.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { emptyTradeOffer, normalizeTradeOffer } = require('./TradeOfferPolicy.js');
const { TradeSettlementService } = require('./TradeSettlementService.js');

class TradeDirectory {
	constructor(players, inventory) {
		this.nextTrade = 1;
		this.players = players;
		this.settlement = new TradeSettlementService(inventory);
		this.tradeByPlayer = new Map();
		this.trades = new Map();
	}

	create(player, targetPlayerId) {
		if (player.id === targetPlayerId) {
			throw new RealtimeError('TRADE_SELF', 'A player cannot trade with themselves.');
		}
		const target = this.players.get(targetPlayerId);
		if (!target || target.kind !== 'human') {
			throw new RealtimeError('PLAYER_NOT_FOUND', 'The trade target does not exist.');
		}
		this.requireAvailable(player.id);
		this.requireAvailable(target.id);
		const trade = {
			acceptedBy: [],
			id: `trade-${this.nextTrade++}`,
			offers: {
				[player.id]: emptyTradeOffer(),
				[target.id]: emptyTradeOffer()
			},
			playerIds: [player.id, target.id],
			status: 'open'
		};
		this.trades.set(trade.id, trade);
		for (const id of trade.playerIds) this.tradeByPlayer.set(id, trade.id);
		return this.snapshot(trade);
	}

	offer(player, tradeId, offer) {
		const trade = this.requireParticipant(player.id, tradeId);
		trade.offers[player.id] = normalizeTradeOffer(offer);
		trade.acceptedBy = [];
		return this.snapshot(trade);
	}

	accept(player, tradeId) {
		const trade = this.requireParticipant(player.id, tradeId);
		if (!trade.acceptedBy.includes(player.id)) trade.acceptedBy.push(player.id);
		if (trade.acceptedBy.length < 2) {
			return { settlement: null, trade: this.snapshot(trade) };
		}
		const settlement = this.settlement.settle(trade, this.players);
		trade.status = 'settled';
		this.release(trade);
		return { settlement, trade: this.snapshot(trade) };
	}

	cancel(player, tradeId) {
		const trade = this.requireParticipant(player.id, tradeId);
		trade.status = 'cancelled';
		this.release(trade);
		return this.snapshot(trade);
	}

	cancelForPlayer(playerId) {
		const trade = this.trades.get(this.tradeByPlayer.get(playerId));
		if (!trade) return null;
		trade.status = 'cancelled';
		this.release(trade);
		return this.snapshot(trade);
	}

	snapshotFor(player) {
		const trade = this.trades.get(this.tradeByPlayer.get(player.id));
		return trade ? this.snapshot(trade) : null;
	}

	snapshot(trade) {
		return JSON.parse(JSON.stringify(trade));
	}

	requireAvailable(playerId) {
		if (this.tradeByPlayer.has(playerId)) {
			throw new RealtimeError('TRADE_ALREADY_ACTIVE', 'The player already has an active trade.');
		}
	}

	requireParticipant(playerId, tradeId) {
		const trade = this.trades.get(tradeId);
		if (!trade || !trade.playerIds.includes(playerId)) {
			throw new RealtimeError('TRADE_NOT_FOUND', 'The requested trade is unavailable.');
		}
		return trade;
	}

	release(trade) {
		this.trades.delete(trade.id);
		for (const id of trade.playerIds) this.tradeByPlayer.delete(id);
	}
}

module.exports = {
	TradeDirectory
};
