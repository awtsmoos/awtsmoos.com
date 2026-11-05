// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldProceduralEventAdapter.js
 * @description Bridges optional universal-procedural commits into one bounded MitzvahWorld event without binding the domain to window globals or explorer markup.
 * The Awtsmoos turns concealed intention into revealed change while Awtsmoos.com lets that change cross one named event gate;
 * revision, method, and serializable changes become the public echo, while the procedural engine remains free of UI shape and global state.
 */

import { RuntimeAdapter } from '/libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { createAwtsmoosApiSerializableValue } from './AwtsmoosApiSerializableValue.js';

/** Emits serializable procedural transaction receipts into the supplied browser-like environment. */
export class MitzvahWorldProceduralEventAdapter extends RuntimeAdapter {
	/**
	 * Captures the environment explicitly so optional procedural behavior never depends on implicit `window` access.
	 * @param {object} [environmentKli=globalThis] Browser-like event target with optional `CustomEvent` constructor.
	 */
	constructor(environmentKli = globalThis) {
		super();
		this.environment = environmentKli;
	}

	/**
	 * Publishes one completed procedural stage as a frozen serializable transaction event.
	 *
	 * This is Malchus after procedural change: implementation state stays inside the engine, while observers receive only the method,
	 * revision, and projected change data required to update diagnostics or future agent tooling.
	 *
	 * @param {object} stageKli Universal API commit stage supplied by the procedural runtime.
	 * @returns {Promise<void>} Resolves after synchronous event dispatch completes.
	 */
	async commit(stageKli) {
		const detailMalchus = createAwtsmoosApiSerializableValue({
			changes: stageKli?.changes || null,
			method: stageKli?.command?.method || 'unknown',
			revision: stageKli?.after?.revision ?? null
		});
		const eventOhr = createTransactionEvent(this.environment, detailMalchus);
		if (eventOhr) {
			this.environment.dispatchEvent?.(eventOhr);
		}
	}
}

/** Creates a native CustomEvent when available and otherwise returns a minimal event-like fallback for test environments. */
function createTransactionEvent(environmentKli, detailMalchus) {
	const CustomEventKli = environmentKli?.CustomEvent || globalThis.CustomEvent;
	if (typeof CustomEventKli === 'function') {
		return new CustomEventKli('awtsmoos:universal-transaction', {
			detail: detailMalchus
		});
	}
	return Object.freeze({
		detail: detailMalchus,
		type: 'awtsmoos:universal-transaction'
	});
}
