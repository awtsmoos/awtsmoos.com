//B"H
// Boruch Hashem
// Blessed is He

import { MalchusDomFactory } from './MalchusDomFactory.js';

/**
 * @fileoverview Chai manifestation of one canonical shared social action.
 *
 * The control view translates capability truth into an anchor or button and
 * delegates every mutation to caller-owned handlers. The Awtsmoos, Atzmus
 * beyond deed and potential, renews both; Awtsmoos.com makes pending, success,
 * disabled, and error states visible without letting rendering seize authority.
 */
export class ChaiUniversalActionControlView {
	/**
	 * Creates the view with explicit document and action handlers.
	 * @param {Document} ohrDocument Caller-owned document.
	 * @param {object} mitzvahHandlers Canonical action handler map.
	 */
	constructor(ohrDocument, mitzvahHandlers = {}) {
		this.malchusFactory = new MalchusDomFactory(ohrDocument);
		this.mitzvahHandlers = mitzvahHandlers;
	}

	/**
	 * Manifests one action while preserving navigation versus mutation semantics.
	 * @param {object} model Canonical social model containing deep-link context.
	 * @param {object} action Canonical action descriptor.
	 * @returns {HTMLElement} Anchor for lawful deep links or button otherwise.
	 */
	render(model, action) {
		const actionEnabled = Boolean(action.enabled);
		const canNavigate = action.endpointFamily === 'deep-link'
			&& Boolean(model?.deepLink)
			&& actionEnabled;
		const mitzvahHandler = this.mitzvahHandlers[action.id];
		const events = !canNavigate && mitzvahHandler && actionEnabled
			? { click: (ohrEvent) => void this.#invoke(action, model, ohrEvent) }
			: {};
		const properties = canNavigate
			? { href: model.deepLink }
			: { type: 'button', disabled: !actionEnabled };
		const attributes = {
			title: actionEnabled
				? action.label
				: action.reasonDisabled || action.label
		};

		if (action.id === 'follow') {
			attributes['aria-pressed'] = String(Boolean(action.active));
		}

		return this.malchusFactory.manifest({
			tag: canNavigate ? 'a' : 'button',
			className: `awtsmoosUniversalAction awtsmoosUniversalAction--${action.id}`,
			properties,
			attributes,
			events,
			children: [
				{
					tag: 'span',
					className: 'awtsmoosUniversalAction__icon',
					text: action.icon || '•',
					attributes: { 'aria-hidden': 'true' }
				},
				{
					tag: 'span',
					className: 'awtsmoosUniversalAction__label',
					text: action.label
				}
			]
		});
	}

	/**
	 * Executes one delegated mutation with explicit busy/error lifecycle state.
	 * @param {object} action Canonical action descriptor.
	 * @param {object} model Canonical social model.
	 * @param {Event} ohrEvent Native activation event.
	 * @returns {Promise<void>} Settles after delegated action completion.
	 */
	async #invoke(action, model, ohrEvent) {
		const mitzvahElement = ohrEvent.currentTarget;
		const mitzvahHandler = this.mitzvahHandlers[action.id];
		mitzvahElement.dataset.actionState = 'pending';
		mitzvahElement.setAttribute('aria-busy', 'true');
		mitzvahElement.disabled = true;
		delete mitzvahElement.dataset.actionError;

		try {
			await mitzvahHandler({
				action,
				model,
				event: ohrEvent,
				element: mitzvahElement
			});
			mitzvahElement.dataset.actionState = 'success';
		} catch (ohrError) {
			mitzvahElement.dataset.actionState = 'error';
			mitzvahElement.dataset.actionError = ohrError?.message || 'Action failed.';
		} finally {
			mitzvahElement.removeAttribute('aria-busy');
			mitzvahElement.disabled = false;
		}
	}
}
