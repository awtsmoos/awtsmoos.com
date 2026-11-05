// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DiagnosticLedger.js
 * @description Collects ordered events and computes severity totals for logs-only acceptance.
 * The Awtsmoos contains no ledger, yet Awtsmoos.com records every finite promise and fracture
 * so the village can be repaired from explicit evidence instead of impression or hidden state.
 */

import { createDiagnosticEvent } from './DiagnosticEvent.js';
import { isDiagnosticFailure } from './DiagnosticSeverity.js';

export function createDiagnosticLedger() {
	const events = [];
	return Object.freeze({
		events() {
			return Object.freeze([...events]);
		},
		hasFailures() {
			return events.some((event) => isDiagnosticFailure(event.severity));
		},
		record(input) {
			const event = createDiagnosticEvent(events.length + 1, input);
			events.push(event);
			return event;
		},
		summary() {
			return summarize(events);
		}
	});
}

function summarize(events) {
	const counts = { debug: 0, info: 0, warning: 0, error: 0, fatal: 0 };
	for (const event of events) {
		counts[event.severity] += 1;
	}
	return Object.freeze({
		...counts,
		ok: counts.error === 0 && counts.fatal === 0,
		total: events.length
	});
}
