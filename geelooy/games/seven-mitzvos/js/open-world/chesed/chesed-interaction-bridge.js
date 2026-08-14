//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file chesed-interaction-bridge.js
 * @description
 * The Awtsmoos renews nearby care as authoritative action only after spatial intention reaches the existing LivingWorld boundary;
 * Awtsmoos.com lets Sanctuary construction and one explicit world day pass through the sole civic service rather than creating a second ecology authority.
 * This bridge owns action dispatch and bounded evidence only; it owns no kernel, save, renderer, or profession state.
 */
export class ChesedInteractionBridge {
	constructor(civicService) {
		this.service = civicService;
		this.city = null;
		this.lastAction = null;
		this.lastResult = null;
	}

	attach(city) {
		this.city = city;
	}

	/** Routes one ecology context to an existing canonical command surface. */
	handle(context, hud) {
		if (context?.type !== 'ecology' || context.disabled) {
			return null;
		}
		try {
			const result = this.execute(context);
			this.lastAction = context.actionId;
			this.lastResult = summarize(result);
			this.city?.refreshCivic();
			return result;
		} catch (error) {
			this.lastAction = context.actionId || 'unknown';
			this.lastResult = { ok: false, error: error.message };
			hud?.context({
				...context,
				text: error.message,
				label: 'Cannot proceed',
				disabled: true
			});
			return null;
		}
	}

	view() {
		return {
			lastAction: this.lastAction,
			lastResult: this.lastResult
		};
	}

	execute(context) {
		if (context.actionId === 'build-sanctuary') {
			return this.service.buildSanctuary(context.parcelId);
		}
		if (context.actionId === 'advance-day') {
			return this.service.advanceDay();
		}
		throw new Error(`Unknown Chesed ecology action: ${context.actionId}`);
	}
}

function summarize(result) {
	return {
		ok: Boolean(result),
		duplicate: Boolean(result?.duplicate),
		revision: result?.state?.revision ?? null,
		events: (result?.events || []).map(event => event.type)
	};
}
