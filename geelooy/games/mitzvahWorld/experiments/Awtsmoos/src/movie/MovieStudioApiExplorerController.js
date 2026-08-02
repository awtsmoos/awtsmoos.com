// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiExplorerController.js
 * @description Renders, filters, and executes the complete public API and rendered UI action inventory.
 * The Awtsmoos renews every callable leaf and visible gesture before discovery can divide them;
 * Awtsmoos.com lets each path be searched, invoked, measured, and answered through one published API.
 */

import {
	formatMovieStudioApiResult,
	renderMovieStudioApiMethodCards,
	renderMovieStudioUiActionCards
} from './MovieStudioApiExplorerRender.js';

export class MovieStudioApiExplorerController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.root = view.root.querySelector('[data-api-explorer]');
		this.renderedPaths = new Set();
		this.disposers = [];
		if (!this.root) return;
		this.search = this.root.querySelector('[data-api-explorer-search]');
		this.methods = this.root.querySelector('[data-api-methods]');
		this.actions = this.root.querySelector('[data-api-actions]');
		this.parity = this.root.querySelector('[data-api-parity]');
		this.listen(this.root.querySelector('[data-api-explorer-refresh]'), 'click', () => this.render());
		this.listen(this.search, 'input', () => this.filter(this.search.value));
		this.listen(this.root, 'click', event => this.onClick(event));
		this.render();
	}

	render() {
		if (!this.root || !this.session.publicApi) return null;
		const methods = this.session.publicApi.ui.methods.list({ includeUnsafe: true });
		const actions = this.session.publicApi.ui.actions.refresh();
		this.renderedPaths = new Set(methods.map(method => method.path));
		this.methods.innerHTML = renderMovieStudioApiMethodCards(methods);
		this.actions.innerHTML = renderMovieStudioUiActionCards(actions);
		const report = this.session.publicApi.ui.parity();
		this.parity.textContent = report.complete
			? `${report.apiMethodCount} API methods and ${report.actionCount} UI actions have parity.`
			: `${report.missingMethodUi.length} methods or ${report.missingActionApi.length} actions are missing parity.`;
		this.parity.dataset.complete = String(report.complete);
		this.filter(this.search?.value || '');
		return report;
	}

	filter(query) {
		const needle = String(query || '').trim().toLowerCase();
		for (const card of this.root?.querySelectorAll?.('[data-api-method-card], [data-api-action-card]') || []) {
			card.hidden = Boolean(needle && !card.textContent.toLowerCase().includes(needle));
		}
	}

	async onClick(event) {
		const methodButton = event.target?.closest?.('[data-api-method-execute]');
		if (methodButton) return this.executeMethod(methodButton.dataset.apiMethodExecute, methodButton);
		const actionButton = event.target?.closest?.('[data-api-action-invoke]');
		if (!actionButton) return null;
		const result = this.session.publicApi.ui.actions.invoke(actionButton.dataset.apiActionInvoke);
		actionButton.title = formatMovieStudioApiResult(result);
		return result;
	}

	async executeMethod(path, button) {
		const card = button.closest('[data-api-method-card]');
		const output = card.querySelector('[data-api-method-result]');
		try {
			const args = JSON.parse(card.querySelector('[data-api-method-args]').value || '[]');
			const result = await this.session.publicApi.ui.methods.invoke(path, args);
			output.textContent = formatMovieStudioApiResult(result);
			return result;
		} catch (error) {
			output.textContent = formatMovieStudioApiResult({ ok: false, error: error.message });
			return null;
		}
	}

	destroy() {
		for (const dispose of this.disposers.splice(0)) dispose();
		this.renderedPaths.clear();
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.disposers.push(() => target?.removeEventListener?.(type, listener));
	}
}
