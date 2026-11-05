// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityExecutor.js
 * @description Commits accepted ability executions and their bounded event hooks transactionally.
 */

import { abilityCastSnapshot } from './TorahAbilityCastRules.js';

export class TorahAbilityExecutor {
	constructor(options) {
		this.bus = options.bus || null;
		this.cooldowns = options.cooldowns;
		this.execute = options.execute;
		this.onApply = options.onApply || (() => {});
		this.onChannelTick = options.onChannelTick || (() => {});
		this.diagnostics = { accepted: 0, executorErrors: 0 };
	}

	commit(cast, now, publishCompletion) {
		let result;
		try {
			result = this.execute(cast.definition, { ...cast.context, castId: cast.castId });
		} catch (error) {
			this.diagnostics.executorErrors += 1;
			return rejected('executor-error', String(error));
		}
		if (!(result === true || result?.ok === true)) {
			return rejected(result?.reason || 'rejected', result?.detail || result);
		}
		this.cooldowns.commit(cast.definition, now);
		this.diagnostics.accepted += 1;
		this.onApply(cast.definition, cast.context, result);
		const detail = this.castDetail(cast, now);
		this.emit(cast.definition.visualEvent, detail);
		this.emit(cast.definition.audioEvent, detail);
		this.emit('quest:event', {
			count: 1,
			passageId: cast.definition.passageId,
			target: cast.definition.id,
			type: 'torah'
		});
		if (publishCompletion) this.emit('torah:cast-complete', detail);
		return { cast: abilityCastSnapshot(cast, now), ok: true, reason: cast.phase };
	}

	channelTick(cast, now, tickIndex) {
		this.onChannelTick(cast.definition, cast.context, tickIndex);
		this.emit('torah:channel-tick', { ...this.castDetail(cast, now), tickIndex });
	}

	completeChannel(cast, now) {
		this.emit('torah:cast-complete', this.castDetail(cast, now));
	}

	snapshot() {
		return { ...this.diagnostics };
	}

	castDetail(cast, now, reason = null) {
		return { ...abilityCastSnapshot(cast, now), reason };
	}

	emit(type, detail) {
		this.bus?.emit(type, detail);
	}
}

function rejected(reason, detail = null) {
	return { detail, ok: false, reason };
}
