// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TradeRequestHandler.js
 * @description Handles participant-only trade creation, offers, consent, and settlement.
 * The Awtsmoos renews exchange through mutual agreement; Awtsmoos.com reveals
 * each private inventory result only to its owner while preserving atomic settlement.
 */

const {
	commandPayload,
	identifier,
	optionalIdentifier
} = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleTradeRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.TRADE_CREATE) {
		const payload = commandPayload(request.payload);
		return changed(context, room, player, RESPONSE_TYPES.TRADE_CREATED, {
			trade: room.trades.create(player, identifier(payload.targetPlayerId, 'Target player id'))
		});
	}
	if (request.type === MESSAGE_TYPES.TRADE_OFFER) {
		const payload = commandPayload(request.payload);
		return changed(context, room, player, RESPONSE_TYPES.TRADE_OFFERED, {
			trade: room.trades.offer(player, identifier(payload.tradeId, 'Trade id'), {
				coins: payload.coins,
				itemId: optionalIdentifier(payload.itemId, 'Item id'),
				quantity: payload.quantity
			})
		});
	}
	if (request.type === MESSAGE_TYPES.TRADE_ACCEPT) {
		const payload = commandPayload(request.payload);
		const outcome = room.trades.accept(player, identifier(payload.tradeId, 'Trade id'));
		return changed(context, room, player, RESPONSE_TYPES.TRADE_ACCEPTED, outcome);
	}
	if (request.type === MESSAGE_TYPES.TRADE_CANCEL) {
		const payload = commandPayload(request.payload);
		return changed(context, room, player, RESPONSE_TYPES.TRADE_CANCELLED, {
			trade: room.trades.cancel(player, identifier(payload.tradeId, 'Trade id'))
		});
	}
	if (request.type === MESSAGE_TYPES.TRADE_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.TRADE_SNAPSHOT, {
			trade: room.trades.snapshotFor(player)
		});
	}
	return null;
}

function changed(context, room, player, type, outcome) {
	const trade = outcome.trade;
	for (const playerId of trade.playerIds) {
		const target = room.roster.clientForPlayer(playerId);
		if (!target) continue;
		context.sendEvent(target, EVENT_TYPES.TRADE_CHANGED, privateOutcome(outcome, playerId));
	}
	return commandResult(type, privateOutcome(outcome, player.id), {
		broadcast: false,
		checkpoint: Boolean(outcome.settlement)
	});
}

function privateOutcome(outcome, playerId) {
	return {
		settlement: outcome.settlement
			? {
				settled: true,
				state: outcome.settlement.playerStates[playerId],
				tradeId: outcome.settlement.tradeId
			}
			: null,
		trade: outcome.trade
	};
}

module.exports = {
	handleTradeRequest
};
