// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityStatusGateway.js
 * @description Routes accepted ability effects to exact targets and bounded gameplay event hooks.
 */

export class TorahAbilityStatusGateway {
	constructor(options) {
		this.bus = options.bus || null;
		this.playerId = options.playerId || 'player';
		this.statuses = options.statuses;
	}

	apply(definition, context, result) {
		const targetIds = this.targetIds(definition, context, result);
		for (const targetId of targetIds) {
			for (const effectId of definition.statusEffects) {
				this.statuses.apply({
					effectId,
					isBoss: Boolean(context.target?.isBoss && context.target.id === targetId),
					sourceId: this.playerId,
					targetId
				});
			}
		}
		if (definition.healing > 0) {
			this.emit('combat:healing', { amount: definition.healing, sourceId: this.playerId, targetIds });
		}
		if (definition.shield > 0) {
			this.emit('combat:shield', { amount: definition.shield, sourceId: this.playerId, targetIds });
		}
		return targetIds;
	}

	channelTick(definition, context, tickIndex) {
		this.emit('combat:channel-impact', {
			abilityId: definition.id,
			damage: definition.damage / 3,
			sourceId: this.playerId,
			targetId: context.target?.id || null,
			tickIndex
		});
	}

	periodicTick(effect) {
		const damagePerTick = Number(effect.modifiers.damagePerTick || 0);
		if (!damagePerTick) return;
		this.emit('combat:status-tick', {
			damage: damagePerTick * effect.stacks * effect.strength * effect.bossScale,
			effectId: effect.effectId,
			sourceId: effect.sourceId,
			targetId: effect.targetId
		});
	}

	targetIds(definition, context, result) {
		if (result?.targetIds?.length) return result.targetIds.slice(0, 12);
		if (definition.targetType === 'selected-ally') {
			const allyId = context.ally?.id || context.target?.id;
			return allyId ? [allyId] : [];
		}
		if (definition.targetType === 'self') return [this.playerId];
		if (definition.targetType === 'ground-point') return [`ground:${definition.id}`];
		return context.target?.id ? [context.target.id] : [];
	}

	emit(type, detail) {
		this.bus?.emit(type, detail);
	}
}
