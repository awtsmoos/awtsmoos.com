//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentInvocation
 * @description
 * The Awtsmoos renews each finite call while Awtsmoos.com gives it a browser correlation thread without pretending that thread is a server transaction or durable idempotency key;
 * this vessel measures one invocation and leaves persistence, publication, DNS, and external verification to their actual authorities.
 */

let fallbackSequence = 0;

/** Begins one browser invocation with correlation metadata kept outside action input. */
export function beginAgentInvocation(action, options = {}) {
	const supplied = normalizedRequestId(options.requestId);
	const startedMs = Date.now();
	return {
		action: String(action || ''),
		requestId: supplied || generatedRequestId(),
		requestIdSource: supplied ? 'caller-correlation' : 'browser-correlation',
		startedAt: new Date(startedMs).toISOString(),
		startedMs
	};
}

/** Finishes timing testimony without exposing the internal epoch used for duration. */
export function finishAgentInvocation(invocation) {
	const finishedMs = Date.now();
	return {
		requestId: invocation.requestId,
		requestIdSource: invocation.requestIdSource,
		action: invocation.action,
		startedAt: invocation.startedAt,
		finishedAt: new Date(finishedMs).toISOString(),
		durationMs: Math.max(0, finishedMs - invocation.startedMs)
	};
}

function normalizedRequestId(value) {
	const source = String(value || '').trim();
	if (!/^[A-Za-z0-9._:-]{1,128}$/.test(source)) {
		return '';
	}
	return source;
}

function generatedRequestId() {
	if (globalThis.crypto?.randomUUID) {
		return `builder:${globalThis.crypto.randomUUID()}`;
	}
	fallbackSequence += 1;
	return `builder:${Date.now().toString(36)}:${fallbackSequence.toString(36)}`;
}
