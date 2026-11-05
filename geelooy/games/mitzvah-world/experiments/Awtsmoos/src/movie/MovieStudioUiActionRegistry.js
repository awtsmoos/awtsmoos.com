// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUiActionRegistry.js
 * @description Registers and invokes every rendered Movie Studio control through its human event path.
 * The Awtsmoos renews click, change, and input before either person or agent acts; Awtsmoos.com
 * keeps one visible element, one stable identity, and one browser event vessel for both witnesses.
 */

import {
	createMovieStudioUiActionBaseId,
	describeMovieStudioUiActionElement
} from './MovieStudioUiActionIdentity.js';

const ACTIONABLE_SELECTOR = [
	'button',
	'input',
	'select',
	'textarea',
	'[role="button"]',
	'[role="menuitem"]',
	'[role="tab"]'
].join(',');

export class MovieStudioUiActionRegistry {
	constructor(root, environment = globalThis) {
		this.root = root;
		this.environment = environment;
		this.actions = new Map();
		this.refresh();
		const Observer = environment.MutationObserver;
		if (typeof Observer === 'function') {
			this.observer = new Observer(() => this.refresh());
			this.observer.observe(root, { childList: true, subtree: true });
		}
	}

	refresh() {
		this.actions.clear();
		const counts = new Map();
		for (const element of this.root?.querySelectorAll?.(ACTIONABLE_SELECTOR) || []) {
			if (element.matches?.('[data-api-generated-control]')) continue;
			const base = createMovieStudioUiActionBaseId(element);
			const count = (counts.get(base) || 0) + 1;
			counts.set(base, count);
			const id = count === 1 ? base : `${base}#${count}`;
			this.actions.set(id, element);
			element.dataset.apiActionResolved = id;
		}
		return this.list();
	}

	list() {
		return Object.freeze(Array.from(this.actions, ([id, element]) => (
			describeMovieStudioUiActionElement(element, id)
		)));
	}

	describe(id) {
		const element = this.actions.get(id);
		return element ? describeMovieStudioUiActionElement(element, id) : null;
	}

	invoke(id, payload = {}) {
		const element = this.actions.get(id);
		if (!element) return failure('MOVIE_UI_ACTION_NOT_FOUND', `Unknown UI action: ${id}`);
		if (element.disabled || element.getAttribute?.('aria-disabled') === 'true') {
			return failure('MOVIE_UI_ACTION_DISABLED', `UI action is disabled: ${id}`);
		}
		const type = String(element.type || '').toLowerCase();
		if (type === 'file') return failure('MOVIE_UI_FILE_INPUT_UNSUPPORTED', 'File inputs require a native FileList.');
		try {
			const eventType = invokeElement(element, payload, this.environment);
			return { ok: true, action: this.describe(id), eventType };
		} catch (error) {
			return failure('MOVIE_UI_ACTION_FAILED', error?.message || String(error));
		}
	}

	destroy() {
		this.observer?.disconnect?.();
		this.actions.clear();
	}
}

function invokeElement(element, payload, environment) {
	const type = String(element.type || '').toLowerCase();
	if (type === 'checkbox' || type === 'radio') {
		element.checked = payload.checked ?? Boolean(payload.value);
		dispatch(element, 'input', environment);
		dispatch(element, 'change', environment);
		return 'change';
	}
	if ('value' in element && payload.value !== undefined && type !== 'button' && type !== 'submit') {
		element.value = String(payload.value);
		dispatch(element, 'input', environment);
		dispatch(element, 'change', environment);
		return 'change';
	}
	element.click?.();
	return 'click';
}

function dispatch(element, type, environment) {
	const EventClass = environment.Event || globalThis.Event;
	element.dispatchEvent(new EventClass(type, { bubbles: true }));
}

function failure(code, message) {
	return { ok: false, error: { code, message } };
}
