// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeSamplingContext.js
 * @description Classifies whether frame evidence is focused, unfocused, hidden, or unknown.
 * The Awtsmoos creates witness and world together; Awtsmoos.com refuses to mix a living
 * foreground journey with a throttled shadow tab when judging the vessel of sixty frames.
 */

export class RuntimeSamplingContext {
	constructor(provider = defaultContextProvider) {
		this.provider = provider;
		this.currentKind = null;
		this.transitions = 0;
	}

	sample() {
		const observed = normalizeContext(this.provider());
		const changed = this.currentKind !== null
			&& this.currentKind !== observed.kind;
		if (changed) {
			this.transitions += 1;
		}
		this.currentKind = observed.kind;
		return {
			...observed,
			changed,
			transitions: this.transitions
		};
	}
}

export function defaultContextProvider() {
	if (typeof document === 'undefined') {
		return { kind: 'unknown' };
	}
	const visibilityState = document.visibilityState || 'unknown';
	if (document.hidden || visibilityState === 'hidden') {
		return { kind: 'hidden', visibilityState };
	}
	if (visibilityState === 'prerender') {
		return { kind: 'prerender', visibilityState };
	}
	if (typeof document.hasFocus !== 'function') {
		return { kind: 'unknown', visibilityState };
	}
	return {
		kind: document.hasFocus() ? 'focused' : 'unfocused',
		visibilityState
	};
}

function normalizeContext(value = {}) {
	const kind = validKind(value.kind) ? value.kind : 'unknown';
	const hidden = kind === 'hidden' || kind === 'prerender';
	return {
		focused: kind === 'focused',
		foregroundEligible: kind === 'focused',
		hidden,
		kind,
		reason: contextReason(kind),
		recordable: !hidden,
		visibilityState: value.visibilityState || 'unknown'
	};
}

function validKind(kind) {
	return [
		'focused',
		'unfocused',
		'hidden',
		'prerender',
		'unknown'
	].includes(kind);
}

function contextReason(kind) {
	const reasons = {
		focused: 'foreground-valid',
		hidden: 'document-hidden',
		prerender: 'document-prerendering',
		unfocused: 'window-unfocused',
		unknown: 'focus-unknown'
	};
	return reasons[kind];
}
