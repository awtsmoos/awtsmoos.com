//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module UniversalActionRail
 * @description The Awtsmoos keeps every lawful social door reachable without crowding the reader's hand;
 * Awtsmoos.com renders a responsive primary budget and retracts every remaining available action into one shared More vessel.
 */
import { createActionOverflow } from './ActionOverflow.js';

function actionElement(document, action, model, handlers) {
	const handler = handlers[action.id];
	const canNavigate = action.enabled && ['open', 'share'].includes(action.id) && model.deepLink;
	const element = canNavigate ? document.createElement('a') : document.createElement('button');
	element.className = `awtsmoosUniversalAction awtsmoosUniversalAction--${action.id}`;
	if (element.tagName === 'BUTTON') {
		element.type = 'button';
		element.disabled = !action.enabled;
	}
	if (element.tagName === 'A') element.href = model.deepLink;
	element.setAttribute('aria-disabled', action.enabled ? 'false' : 'true');
	element.title = action.enabled ? action.label : action.reasonDisabled || 'Not available';
	const icon = document.createElement('span');
	icon.className = 'awtsmoosUniversalAction__icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = action.icon || '·';
	const label = document.createElement('span');
	label.textContent = action.label;
	element.append(icon, label);
	if (handler && action.enabled) {
		element.addEventListener('click', event => {
			event.preventDefault();
			handler({ action, model, event });
		});
	}
	return element;
}

export function createUniversalActionRail({
	document = globalThis.document,
	model,
	handlers = {},
	limit = 5,
	windowRef = globalThis
}) {
	const root = document.createElement('nav');
	root.className = 'awtsmoosUniversalActionRail';
	root.setAttribute('aria-label', `${model?.type || 'Social'} actions`);
	const actions = (model?.actions || []).filter(action => action.available !== false);
	root.append(createActionOverflow({
		document,
		actions,
		maximumVisible: limit,
		windowRef,
		renderItem: action => actionElement(document, action, model, handlers)
	}));
	return root;
}

export { actionElement };
